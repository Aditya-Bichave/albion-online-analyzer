import { ImageResponse } from 'next/og';
import { getBuild } from '@/lib/builds-service';

export const alt = 'Build Details';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Helper to extract item name from ID
function getItemName(itemId: string): string {
  if (!itemId) return '';
  const parts = itemId.split('_');
  let name = parts.slice(1).join(' ').replace(/_/g, ' ');
  return name.replace(/\b\w/g, l => l.toUpperCase());
}

// Helper to get item tier
function getItemTier(itemId: string): string {
  const match = itemId.match(/T(\d+)/);
  return match ? `T${match[1]}` : '';
}

// Format numbers (e.g., 1234 → 1.2k)
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

export default async function Image({ params }: { params: Promise<{ category: string; id: string }> }) {
  const { id } = await params;
  const build = await getBuild(id);

  if (!build) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: '#09090b',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          Build Not Found
        </div>
      ),
      { ...size }
    );
  }

  const items = build.items || {};
  const is2H = items.MainHand?.Type?.includes('_2H_');
  
  // Inventory grid layout (3x3)
  const inventoryItems = [
    items.Bag?.Type || '',
    items.Head?.Type || '',
    items.Cape?.Type || '',
    items.MainHand?.Type || '',
    items.Armor?.Type || '',
    is2H ? '' : (items.OffHand?.Type || ''),
    items.Potion?.Type || '',
    items.Shoes?.Type || '',
    items.Food?.Type || ''
  ];

  // Calculate stats
  const rating = build.rating || 0;
  const ratingCount = build.ratingCount || 0;
  const likes = build.likes || 0;
  const views = build.views || 0;
  const stars = Math.round(rating);

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'relative',
          padding: 60,
        }}
      >
        {/* Decorative Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />

        {/* AlbionKit Brand */}
        <div style={{
          position: 'absolute',
          top: 40,
          left: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#f59e0b',
            letterSpacing: '-0.02em',
          }}>
            AlbionKit
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 60,
          width: '100%',
          maxWidth: '1100px',
          marginTop: 20,
        }}>
          {/* Left Column: Text Info */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}>
            {/* Category Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '6px 16px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '2px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 20,
              marginBottom: 16,
              alignSelf: 'flex-start',
            }}>
              <div style={{ fontSize: 16, color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase' }}>
                {build.category}
              </div>
            </div>

            {/* Build Title */}
            <div style={{
              fontSize: 48,
              fontWeight: 900,
              marginBottom: 12,
              textAlign: 'left',
              background: 'linear-gradient(to bottom, #ffffff, #f59e0b)',
              backgroundClip: 'text',
              color: 'transparent',
              lineHeight: 1.2,
            }}>
              {build.title}
            </div>

            {/* Description */}
            <div style={{
              fontSize: 20,
              color: '#a1a1aa',
              marginBottom: 24,
              lineHeight: 1.4,
              maxWidth: '500px',
            }}>
              {build.description.length > 80 
                ? build.description.substring(0, 80) + '...'
                : build.description
              }
            </div>

            {/* Stats Row */}
            <div style={{
              display: 'flex',
              gap: 24,
              marginBottom: 20,
              flexWrap: 'wrap',
            }}>
              {/* Rating */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: 8,
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b' }}>
                  {Array(Math.min(5, stars)).fill('*').join('')}
                  {Array(5 - Math.min(5, stars)).fill('o').join('')}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#e4e4e7' }}>
                  {rating.toFixed(1)}
                </div>
                <div style={{ fontSize: 14, color: '#71717a' }}>
                  ({formatNumber(ratingCount)})
                </div>
              </div>

              {/* Likes */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 8,
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>Likes</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#e4e4e7' }}>
                  {formatNumber(likes)}
                </div>
              </div>

              {/* Views */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: 8,
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6' }}>Views</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#e4e4e7' }}>
                  {formatNumber(views)}
                </div>
              </div>
            </div>

            {/* Creator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 18,
              color: '#a1a1aa',
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                color: 'white',
              }}>
                {(build.authorName || '').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 14, color: '#71717a' }}>Created by</div>
                <div style={{ fontWeight: 600, color: '#e4e4e7' }}>{build.authorName || 'Unknown'}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Inventory Grid */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {/* Row 1 */}
            <div style={{ display: 'flex', gap: 12 }}>
              {[0, 1, 2].map((idx) => {
                const itemId = inventoryItems[idx];
                const itemName = getItemName(itemId);
                const tier = getItemTier(itemId);
                const hasItem = itemId !== '';
                return (
                  <div
                    key={`row1-${idx}`}
                    style={{
                      width: '120px',
                      height: '120px',
                      background: hasItem 
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: hasItem
                        ? '2px solid rgba(245, 158, 11, 0.4)'
                        : '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 10,
                      position: 'relative',
                    }}
                  >
                    {hasItem ? (
                      <>
                        <div style={{
                          position: 'absolute',
                          top: 6,
                          left: 10,
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#f59e0b',
                        }}>
                          {tier}
                        </div>
                        <div style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#e4e4e7',
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.3,
                          marginTop: 6,
                        }}>
                          {itemName}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.2)' }}>Empty</div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Row 2 */}
            <div style={{ display: 'flex', gap: 12 }}>
              {[3, 4, 5].map((idx) => {
                const itemId = inventoryItems[idx];
                const itemName = getItemName(itemId);
                const tier = getItemTier(itemId);
                const hasItem = itemId !== '';
                return (
                  <div
                    key={`row2-${idx}`}
                    style={{
                      width: '120px',
                      height: '120px',
                      background: hasItem 
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: hasItem
                        ? '2px solid rgba(245, 158, 11, 0.4)'
                        : '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 10,
                      position: 'relative',
                    }}
                  >
                    {hasItem ? (
                      <>
                        <div style={{
                          position: 'absolute',
                          top: 6,
                          left: 10,
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#f59e0b',
                        }}>
                          {tier}
                        </div>
                        <div style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#e4e4e7',
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.3,
                          marginTop: 6,
                        }}>
                          {itemName}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.2)' }}>Empty</div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Row 3 */}
            <div style={{ display: 'flex', gap: 12 }}>
              {[6, 7, 8].map((idx) => {
                const itemId = inventoryItems[idx];
                const itemName = getItemName(itemId);
                const tier = getItemTier(itemId);
                const hasItem = itemId !== '';
                return (
                  <div
                    key={`row3-${idx}`}
                    style={{
                      width: '120px',
                      height: '120px',
                      background: hasItem 
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: hasItem
                        ? '2px solid rgba(245, 158, 11, 0.4)'
                        : '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 10,
                      position: 'relative',
                    }}
                  >
                    {hasItem ? (
                      <>
                        <div style={{
                          position: 'absolute',
                          top: 6,
                          left: 10,
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#f59e0b',
                        }}>
                          {tier}
                        </div>
                        <div style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#e4e4e7',
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.3,
                          marginTop: 6,
                        }}>
                          {itemName}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.2)' }}>Empty</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer URL */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          fontSize: 16,
          color: '#52525b',
          letterSpacing: '0.05em',
          fontWeight: 500,
        }}>
          albionkit.com/builds/{id.substring(0, 8)}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
