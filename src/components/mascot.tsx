'use client';

export function Mascot({
  size = 'md',
  expression = 'happy',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  expression?: 'happy' | 'excited' | 'thinking';
}) {
  const sizeClasses = {
    xs: 'w-12 h-12',
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <svg
        viewBox='0 0 100 100'
        className='h-full w-full'
        role='img'
        aria-label={`${expression} mascot character`}
      >
        {/* Body - cute rice ball shape */}
        <ellipse
          cx='50'
          cy='55'
          rx='35'
          ry='40'
          fill='white'
          stroke='#FF6B35'
          strokeWidth='3'
        />

        {/* Nori (seaweed) band */}
        <path
          d='M20,70 Q50,90 80,70 L80,85 Q50,105 20,85 Z'
          fill='#2D2D2D'
        />

        {/* Face */}
        {expression === 'happy' && (
          <>
            {/* Eyes */}
            <ellipse
              cx='35'
              cy='50'
              rx='5'
              ry='6'
              fill='#2D2D2D'
            />
            <ellipse
              cx='65'
              cy='50'
              rx='5'
              ry='6'
              fill='#2D2D2D'
            />
            {/* Blush */}
            <ellipse
              cx='25'
              cy='58'
              rx='6'
              ry='4'
              fill='#FFB4A2'
              opacity='0.6'
            />
            <ellipse
              cx='75'
              cy='58'
              rx='6'
              ry='4'
              fill='#FFB4A2'
              opacity='0.6'
            />
            {/* Smile */}
            <path
              d='M40,62 Q50,72 60,62'
              stroke='#2D2D2D'
              strokeWidth='2'
              fill='none'
              strokeLinecap='round'
            />
          </>
        )}

        {expression === 'excited' && (
          <>
            {/* Star eyes */}
            <text
              x='30'
              y='55'
              fontSize='14'
              fill='#FF6B35'
            >
              ★
            </text>
            <text
              x='60'
              y='55'
              fontSize='14'
              fill='#FF6B35'
            >
              ★
            </text>
            {/* Big smile */}
            <path
              d='M35,62 Q50,78 65,62'
              stroke='#2D2D2D'
              strokeWidth='2'
              fill='none'
              strokeLinecap='round'
            />
            {/* Blush */}
            <ellipse
              cx='25'
              cy='60'
              rx='6'
              ry='4'
              fill='#FFB4A2'
              opacity='0.8'
            />
            <ellipse
              cx='75'
              cy='60'
              rx='6'
              ry='4'
              fill='#FFB4A2'
              opacity='0.8'
            />
          </>
        )}

        {expression === 'thinking' && (
          <>
            {/* Eyes looking up */}
            <ellipse
              cx='35'
              cy='48'
              rx='5'
              ry='6'
              fill='#2D2D2D'
            />
            <ellipse
              cx='65'
              cy='48'
              rx='5'
              ry='6'
              fill='#2D2D2D'
            />
            <circle
              cx='37'
              cy='46'
              r='2'
              fill='white'
            />
            <circle
              cx='67'
              cy='46'
              r='2'
              fill='white'
            />
            {/* Thinking mouth */}
            <ellipse
              cx='50'
              cy='65'
              rx='4'
              ry='3'
              fill='#2D2D2D'
            />
          </>
        )}
      </svg>
    </div>
  );
}
