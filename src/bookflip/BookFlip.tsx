import { PageFlip } from 'page-flip';
import React, { useEffect, useImperativeHandle, useState } from 'react';

interface IBookFlip {
    // pages: Array<{
    //     changedToMatter: {
    //         [key: string]: any;
    //     };
    //     clean: string;
    // }>;
    createPages: (pageFlip: PageFlip) => void;
}
enum SizeType {
    /** Dimensions are fixed */
    FIXED = 'fixed',
    /** Dimensions are calculated based on the parent element */
    STRETCH = 'stretch',
}

export interface BookFlipActions {
    prevPage: () => void;
    nextPage: () => void;
    pageFlip?: PageFlip;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export const BookFlip = React.forwardRef<BookFlipActions, IBookFlip>(({ createPages }, ref) => {
    const [pageFlip, setPageFlip] = useState<PageFlip>();
    const [currentPage, setCurrentPage] = useState(0);
    const calculateRatio = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth < window.innerHeight) {
                return {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    disableFlipByClick: true,
                };
            } else {
                return {
                    width: window.innerWidth / 2.0,
                    height: window.innerHeight,
                    disableFlipByClick: false,
                };
            }
        }
        return {
            width: 640,
            height: 740,
        };
    };

    useEffect(() => {
        const pf = new PageFlip(document.getElementById('flipbook-container')!, {
            ...calculateRatio(),
            minWidth: 320,
            minHeight: 528.75,
            showCover: true,
            drawShadow: true,
            flippingTime: 800,
            startZIndex: 0,
            swipeDistance: 30,
            mobileScrollSupport: true,
            useMouseEvents: true,
            clickEventForward: false,
            usePortrait: true,
            size: SizeType.STRETCH,
        });
        createPages(pf);
        pf.on('changeState', () => {
            setCurrentPage(pf.getCurrentPageIndex());
        });
        pf.loadFromHTML(document.querySelectorAll('.page'));
        setPageFlip(pf);
        return () => {
            pf.destroy();
        };
    }, []);

    const nextPage = () => {
        const performTurn = currentPage + 2 > (pageFlip?.getPageCount() || 2) ? false : true;
        if (performTurn) {
            pageFlip?.turnToNextPage();
            setCurrentPage(pageFlip?.getCurrentPageIndex() || currentPage);
        }
    };
    const prevPage = () => {
        const performTurn = currentPage - 2 < 0 ? false : true;
        if (performTurn) {
            pageFlip?.turnToPrevPage();
            setCurrentPage(pageFlip?.getCurrentPageIndex() || currentPage);
        }
    };

    useImperativeHandle(
        ref,
        () => ({
            nextPage,
            prevPage,
            pageFlip,
            currentPage,
            setCurrentPage,
        }),
        [currentPage, pageFlip],
    );

    return (
        <div id="flipbook-container">
            <div id="page-storage"></div>
            <div className="page page-cover page-cover-bottom" data-density="hard">
                <div className="page-content"></div>
            </div>
        </div>
    );
});
