/** SVG path data for 12 body regions in a standing upright relaxed pose.
 *  Body is centered at x=100 within a viewBox with label margins on each side. */

interface BodyRegionPath {
  id: string
  d: string
  /** Optional enlarged hit area path for small regions */
  hitD?: string
  /** Anchor point for arrow endpoint (nearest edge to label side) */
  anchor: { x: number; y: number }
  /** Position for the label bubble (outside the silhouette) */
  labelAnchor: { x: number; y: number }
  /** Side the label sits on — determines arrow direction */
  labelSide: 'left' | 'right'
}

/** ViewBox with margins for labels: 50px left, 50px right */
export const VIEWBOX = '-50 -10 300 450'

export const bodyRegionPaths: BodyRegionPath[] = [
  // HEAD GROUP — oval skull + face, jaw inside lower face, narrow throat
  {
    id: 'head',
    d: 'M78 28 C78 8 87 -2 100 -2 C113 -2 122 8 122 28 L122 48 C122 64 114 72 100 72 C86 72 78 64 78 48 Z',
    hitD: 'M72 28 C72 4 83 -8 100 -8 C117 -8 128 4 128 28 L128 50 C128 68 118 78 100 78 C82 78 72 68 72 50 Z',
    anchor: { x: 122, y: 24 },
    labelAnchor: { x: 172, y: 24 },
    labelSide: 'right',
  },
  {
    id: 'jaw',
    d: 'M88 48 C88 44 93 42 100 42 C107 42 112 44 112 48 L112 58 C112 66 107 70 100 70 C93 70 88 66 88 58 Z',
    hitD: 'M83 44 C83 38 89 34 100 34 C111 34 117 38 117 44 L117 62 C117 72 111 76 100 76 C89 76 83 72 83 62 Z',
    anchor: { x: 88, y: 56 },
    labelAnchor: { x: 0, y: 56 },
    labelSide: 'left',
  },
  {
    id: 'throat',
    // Slightly shorter neck to recover vertical space on compact mobile viewports.
    d: 'M94 70 C94 68 96 66 100 66 C104 66 106 68 106 70 L106 90 C106 96 104 100 100 100 C96 100 94 96 94 90 Z',
    hitD: 'M83 66 C83 62 89 58 100 58 C111 58 117 62 117 66 L117 94 C117 102 111 106 100 106 C89 106 83 102 83 94 Z',
    anchor: { x: 106, y: 82 },
    labelAnchor: { x: 172, y: 86 },
    labelSide: 'right',
  },
  // TORSO GROUP — shoulders yoke, front chest, back, stomach
  {
    id: 'shoulders',
    d: 'M100 104 C86 104 68 108 54 116 C50 118 48 122 50 126 L52 132 C56 130 70 124 82 122 L82 114 C82 110 90 106 100 106 C110 106 118 110 118 114 L118 122 C130 124 144 130 148 132 L150 126 C152 122 150 118 146 116 C132 108 114 104 100 104 Z',
    anchor: { x: 56, y: 118 },
    labelAnchor: { x: 0, y: 118 },
    labelSide: 'left',
  },
  {
    id: 'chest',
    d: 'M80 120 C80 116 88 112 100 112 C112 112 120 116 120 120 L120 182 C120 188 112 192 100 192 C88 192 80 188 80 182 Z',
    anchor: { x: 120, y: 152 },
    labelAnchor: { x: 172, y: 148 },
    labelSide: 'right',
  },
  {
    id: 'upper-back',
    d: 'M66 124 C66 120 80 114 100 114 C120 114 134 120 134 124 L134 182 C134 188 120 192 100 192 C80 192 66 188 66 182 Z',
    anchor: { x: 66, y: 152 },
    labelAnchor: { x: 0, y: 152 },
    labelSide: 'left',
  },
  {
    id: 'stomach',
    d: 'M84 190 C84 186 90 184 100 184 C110 184 116 186 116 190 L116 238 C116 244 110 248 100 248 C90 248 84 244 84 238 Z',
    anchor: { x: 84, y: 216 },
    labelAnchor: { x: 0, y: 216 },
    labelSide: 'left',
  },
  {
    id: 'lower-back',
    d: 'M70 192 C70 188 82 184 100 184 C118 184 130 188 130 192 L130 238 C130 244 118 248 100 248 C82 248 70 244 70 238 Z',
    anchor: { x: 130, y: 216 },
    labelAnchor: { x: 172, y: 216 },
    labelSide: 'right',
  },
  // ARMS GROUP — hanging at sides, slightly curved outward
  {
    id: 'arms',
    d: 'M52 124 C46 136 42 156 42 182 L42 252 C42 262 46 268 50 268 C54 268 56 264 56 256 L56 182 C56 158 56 140 54 130 Z M148 124 C154 136 158 156 158 182 L158 252 C158 262 154 268 150 268 C146 268 144 264 144 256 L144 182 C144 158 144 140 146 130 Z',
    anchor: { x: 150, y: 190 },
    labelAnchor: { x: 172, y: 180 },
    labelSide: 'right',
  },
  {
    id: 'hands',
    d: 'M36 264 C32 268 28 276 30 284 C32 292 40 296 48 294 C54 292 58 286 56 278 C54 272 48 268 42 266 Z M164 264 C168 268 172 276 170 284 C168 292 160 296 152 294 C146 292 142 286 144 278 C146 272 152 268 158 266 Z',
    hitD: 'M30 260 C24 264 20 274 22 286 C24 298 34 304 46 302 C56 300 62 292 60 280 C58 270 52 264 44 262 Z M170 260 C176 264 180 274 178 286 C176 298 166 304 154 302 C144 300 138 292 140 280 C142 270 148 264 156 262 Z',
    anchor: { x: 42, y: 278 },
    labelAnchor: { x: 0, y: 278 },
    labelSide: 'left',
  },
  // LEGS GROUP — long, straight, slight gap between
  {
    id: 'legs',
    d: 'M82 246 C78 256 76 276 76 302 C76 336 78 366 80 386 C82 394 86 398 90 398 C94 398 96 394 96 386 C96 366 96 336 96 302 C96 276 96 258 94 248 Z M118 246 C122 256 124 276 124 302 C124 336 122 366 120 386 C118 394 114 398 110 398 C106 398 104 394 104 386 C104 366 104 336 104 302 C104 276 104 258 106 248 Z',
    anchor: { x: 124, y: 330 },
    labelAnchor: { x: 172, y: 330 },
    labelSide: 'right',
  },
  {
    id: 'feet',
    d: 'M68 394 C64 396 60 402 62 408 C64 414 72 418 86 416 C94 414 98 408 96 402 C94 398 86 394 78 394 Z M132 394 C136 396 140 402 138 408 C136 414 128 418 114 416 C106 414 102 408 104 402 C106 398 114 394 122 394 Z',
    hitD: 'M62 390 C56 392 52 400 54 410 C56 418 66 424 84 422 C96 420 102 412 100 404 C98 396 90 390 80 390 Z M138 390 C144 392 148 400 146 410 C144 418 134 424 116 422 C104 420 98 412 100 404 C102 396 110 390 120 390 Z',
    anchor: { x: 72, y: 406 },
    labelAnchor: { x: 0, y: 400 },
    labelSide: 'left',
  },
]
