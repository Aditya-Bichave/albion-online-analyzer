const { getRandomResource } = require('./models');

class Simulator {
    constructor(broadcastCallback, logger = null) {
        this.broadcast = broadcastCallback;
        this.logger = logger;
        this.intervalId = null;
        this.nodes = new Map();
        this.zoneInfo = null;
        
        // Simulating the user moving around
        this.posX = 0;
        this.posY = 0;
    }

    start() {
        if (this.intervalId) return;
        this.nodes.clear();
        this.posX = 0;
        this.posY = 0;
        this.zoneInfo = {
            zoneId: '0314',
            name: '0314',
            mapSize: 1000,
            pvpType: 'yellow',
            tier: 5,
            mapAsset: '0314'
        };
        this.logger?.info('simulation_started', {
            zoneInfo: this.zoneInfo
        });

        // Simulate entering a zone
        this.broadcast({
            event: 'ZONE_ENTER',
            data: this.zoneInfo
        });

        // Initialize some pre-existing nodes
        for (let i = 0; i < 20; i++) {
            this.generateNode();
        }

        // Simulate moving and discovering nodes periodically
        this.intervalId = setInterval(() => {
            if (this.nodes.size < 150) { // Limit nodes
                this.generateNode();
            }

            // Simulate minor player movement
            this.posX += (Math.random() - 0.5) * 5;
            this.posY += (Math.random() - 0.5) * 5;
            this.logger?.debug('simulation_player_move', {
                x: this.posX,
                y: this.posY,
                nodeCount: this.nodes.size
            });

            this.broadcast({
                event: 'PLAYER_MOVE',
                data: { x: this.posX, y: this.posY }
            });
        }, 1500);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.logger?.info('simulation_stopped', {
            remainingNodes: this.nodes.size
        });
        this.zoneInfo = null;
    }

    getSnapshot() {
        return {
            mode: 'simulation',
            nodes: Array.from(this.nodes.values()),
            players: [],
            worldEntities: [],
            playerPos: { x: this.posX, y: this.posY },
            zoneInfo: this.zoneInfo
        };
    }

    generateNode() {
        const id = Math.random().toString(36).substr(2, 9);
        const resource = getRandomResource();
        
        // Spread nodes randomly across a -500 to 500 grid
        const x = (Math.random() - 0.5) * 1000;
        const y = (Math.random() - 0.5) * 1000;
        const charges = Math.floor(Math.random() * 5) + 1; // Amount of gathers left

        const nodeData = {
            id,
            x: x.toFixed(2),
            y: y.toFixed(2),
            ...resource,
            charges
        };

        this.nodes.set(id, nodeData);
        this.logger?.debug('simulation_node_generated', nodeData);

        this.broadcast({
            event: 'NEW_NODE',
            data: nodeData
        });
    }
}

module.exports = Simulator;
