from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "graphify-out"


def ensure_graphify() -> None:
    try:
        import graphify  # noqa: F401
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(ROOT / "requirements.txt")])


def build_community_labels(graph, communities: dict[int, list[str]]) -> dict[int, str]:
    degree = dict(graph.degree())
    labels: dict[int, str] = {}

    for cid, nodes in communities.items():
        ordered = sorted(nodes, key=lambda node_id: degree.get(node_id, 0), reverse=True)
        chosen: list[str] = []

        for node_id in ordered:
            label = str(graph.nodes[node_id].get("label", node_id)).strip()
            if not label:
                continue
            if label.startswith(".") and label.endswith("()"):
                continue
            if label.endswith((".js", ".jsx", ".ts", ".tsx", ".py", ".md", ".json", ".html", ".css")):
                continue
            if label not in chosen:
                chosen.append(label)
            if len(chosen) == 2:
                break

        labels[cid] = " / ".join(chosen) if chosen else f"Community {cid}"

    return labels


def relative_paths(paths: list[str]) -> list[str]:
    output: list[str] = []
    for item in paths:
        path = Path(item)
        try:
            output.append(str(path.resolve().relative_to(ROOT.resolve())))
        except ValueError:
            output.append(str(path))
    return output


def main() -> int:
    parser = argparse.ArgumentParser(description="Safe graphify refresh helper")
    parser.add_argument(
        "--force-code-only",
        action="store_true",
        help="Rebuild using fresh AST plus cached semantic results even if uncached non-code files exist.",
    )
    args = parser.parse_args()

    ensure_graphify()

    from graphify.analyze import god_nodes, surprising_connections, suggest_questions
    from graphify.build import build
    from graphify.cache import check_semantic_cache
    from graphify.cluster import cluster, score_all
    from graphify.detect import detect
    from graphify.export import to_html, to_json
    from graphify.extract import extract
    from graphify.report import generate

    detection = detect(ROOT)
    code_files = [Path(path) for path in detection.get("files", {}).get("code", [])]
    non_code_files: list[str] = []
    for key in ("document", "paper", "image"):
        non_code_files.extend(detection.get("files", {}).get(key, []))

    cached_nodes, cached_edges, cached_hyperedges, uncached = check_semantic_cache(non_code_files, ROOT)
    uncached_relative = relative_paths(uncached)

    if uncached and not args.force_code_only:
        print("Graphify refresh aborted to avoid dropping semantic context.")
        print("Uncached non-code files were detected:")
        for item in uncached_relative[:20]:
            print(f"  - {item}")
        print("")
        print("Run /graphify . in the coding assistant for a full semantic rebuild,")
        print("or rerun this helper with --force-code-only if you explicitly want a partial refresh.")
        return 2

    ast_result = {
        "nodes": [],
        "edges": [],
        "hyperedges": [],
        "input_tokens": 0,
        "output_tokens": 0,
    }
    if code_files:
        ast_result = extract(code_files)

    semantic_result = {
        "nodes": cached_nodes,
        "edges": cached_edges,
        "hyperedges": cached_hyperedges,
        "input_tokens": 0,
        "output_tokens": 0,
    }

    graph = build([ast_result, semantic_result], directed=False)
    communities = cluster(graph)
    cohesion = score_all(graph, communities)
    community_labels = build_community_labels(graph, communities)
    gods = god_nodes(graph)
    surprises = surprising_connections(graph, communities)
    questions = suggest_questions(graph, communities, community_labels)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    report = generate(
        graph,
        communities,
        cohesion,
        community_labels,
        gods,
        surprises,
        detection,
        {
            "input": ast_result.get("input_tokens", 0),
            "output": ast_result.get("output_tokens", 0),
        },
        str(ROOT),
        suggested_questions=questions,
    )

    (OUT_DIR / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")
    to_json(graph, communities, str(OUT_DIR / "graph.json"))
    try:
        to_html(graph, communities, str(OUT_DIR / "graph.html"), community_labels=community_labels)
    except ValueError as exc:
        print(f"Skipping HTML export: {exc}")

    summary = {
        "root": str(ROOT),
        "total_files": detection.get("total_files", 0),
        "total_words": detection.get("total_words", 0),
        "code_files": len(code_files),
        "cached_non_code_files": len(non_code_files) - len(uncached),
        "uncached_non_code_files": uncached_relative,
        "force_code_only": args.force_code_only,
        "nodes": graph.number_of_nodes(),
        "edges": graph.number_of_edges(),
        "communities": len(communities),
    }
    (OUT_DIR / "graph_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(
        f"Graphify refresh complete: {graph.number_of_nodes()} nodes, "
        f"{graph.number_of_edges()} edges, {len(communities)} communities."
    )
    if uncached_relative:
        print("Warning: some non-code files were not included because semantic cache was missing.")
    print(f"Wrote outputs to {OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
