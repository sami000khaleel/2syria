import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Arrows = ({scrollLeft,scrollRight}) => {
    return (
        <span id='scroll-images' className='flex items-center gap-1.5'>
           <button
             onClick={scrollLeft}
             aria-label="previous place"
             className="grid h-9 w-9 cursor-pointer place-content-center rounded-full border border-sand-200 bg-white text-ink-700 transition hover:border-brand-500 hover:bg-brand-500 hover:text-white active:scale-95 dark:border-ink-700 dark:bg-ink-850 dark:text-ink-100 dark:hover:border-brand-400 dark:hover:bg-brand-400 dark:hover:text-ink-950"
           >
             <ChevronLeft size={20} strokeWidth={2.5} />
           </button>

            <button
              onClick={scrollRight}
              aria-label="next place"
              className="grid h-9 w-9 cursor-pointer place-content-center rounded-full border border-sand-200 bg-white text-ink-700 transition hover:border-brand-500 hover:bg-brand-500 hover:text-white active:scale-95 dark:border-ink-700 dark:bg-ink-850 dark:text-ink-100 dark:hover:border-brand-400 dark:hover:bg-brand-400 dark:hover:text-ink-950"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
        </span>
    );
};

export default Arrows;
