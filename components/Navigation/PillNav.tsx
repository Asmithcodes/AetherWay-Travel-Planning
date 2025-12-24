import React, { useRef, useEffect, useState } from 'react';

interface PillNavItem {
  label: string;
  href: string;
}

export interface PillNavProps {
  items: PillNavItem[];
  initialActiveIndex?: number;
  onItemClick?: (index: number) => void;
}

const PillNav: React.FC<PillNavProps> = ({
  items,
  initialActiveIndex = 0,
  onItemClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(initialActiveIndex);

  const updatePillPosition = (element: HTMLElement) => {
    if (!containerRef.current || !pillRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    Object.assign(pillRef.current.style, styles);
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    e.preventDefault();
    const liEl = e.currentTarget.parentElement;
    if (activeIndex === index || !liEl) return;
    setActiveIndex(index);
    updatePillPosition(liEl);
    if (onItemClick) {
      onItemClick(index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const liEl = e.currentTarget.parentElement;
      if (liEl) {
        handleClick(
          {
            currentTarget: liEl.querySelector('a'),
            preventDefault: () => { }
          } as React.MouseEvent<HTMLAnchorElement>,
          index
        );
      }
    }
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const activeLi = navRef.current.querySelectorAll('li')[activeIndex] as HTMLElement;
    if (activeLi) {
      updatePillPosition(activeLi);
      if (pillRef.current) {
        pillRef.current.classList.add('active');
      }
    }
    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex] as HTMLElement;
      if (currentActiveLi) {
        updatePillPosition(currentActiveLi);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  return (
    <>
      {/* This effect is quite difficult to recreate faithfully using Tailwind, so a style tag is a necessary workaround */}
      <style>
        {`
          .effect {
            position: absolute;
            opacity: 0;
            pointer-events: none;
            background: white;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: -1;
          }
          .effect.active {
            opacity: 1;
          }
          li {
            position: relative;
            transition: all 0.3s ease;
          }
          li a {
            position: relative;
          }
          li.active {
            color: #0f172a !important;
          }
          li.active a {
            color: #0f172a !important;
          }
        `}
      </style>
      <div className="relative" ref={containerRef}>
        <nav className="flex relative" style={{ transform: 'translate3d(0,0,0.01px)' }}>
          <ul
            ref={navRef}
            className="flex gap-8 list-none p-0 px-4 m-0 relative z-[3]"
            style={{
              color: 'white',
              textShadow: '0 1px 1px hsl(205deg 30% 10% / 0.2)'
            }}
          >
            {items.map((item, index) => (
              <li
                key={index}
                className={`rounded-full relative cursor-pointer transition-[background-color_color_box-shadow] duration-300 ease shadow-[0_0_0.5px_1.5px_transparent] text-white ${activeIndex === index ? 'active' : ''
                  }`}
              >
                <a
                  href={item.href}
                  onClick={e => handleClick(e, index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  className="outline-none py-[0.6em] px-[1em] inline-block"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <span className="effect" ref={pillRef} />
      </div>
    </>
  );
};

export default PillNav;
