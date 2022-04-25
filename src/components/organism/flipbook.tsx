import { insertMarkdownPage } from '@/src/bookflip';
import { AddPagesWithContent, AddFrontPage } from '@/src/components/atoms/AddPage';
import { currentPageAtom } from '@/src/state';
import { Wrapper, LogoPB, Btn } from '@/src/styles/styleBook';
import { getFieldsOfStudy, Graduate, getScienceContent } from '@/ssg';
import { useAtom } from 'jotai';
import { TableOfContents } from '../atoms/TableOfContents';
import { useRouter } from 'next/router';
import { PageFlip } from 'page-flip';
import React, { useEffect, useState } from 'react';
import { Chevron } from '../atoms/chevron';

interface IFlipBook {
    pages: Array<{
        changedToMatter: {
            [key: string]: any;
        };
        clean: string;
    }>;
    graduate: ReturnType<typeof Graduate>;
    science: ReturnType<typeof getScienceContent>;
    foStudy: ReturnType<typeof getFieldsOfStudy>;
    // tableOfContents: ReturnType<typeof getTableOfContents>;

    whichPage?: number;
}
enum SizeType {
    /** Dimensions are fixed */
    FIXED = 'fixed',
    /** Dimensions are calculated based on the parent element */
    STRETCH = 'stretch',
}

export const FlipBook: React.FC<IFlipBook> = ({ pages, graduate, science, foStudy }) => {
    const [pageFlip, setPageFlip] = useState<PageFlip>();
    const [tableOfContentArray, setTableOfContentArray] = useState<{ [key: string]: string | number }[]>([{}]);
    const router = useRouter();
    const [currentPage, setCurrentPage] = useAtom(currentPageAtom);
    const [totalPages, setTotalPages] = useState(0);
    let index = 0;
    let arrayOfSectionsNames: Array<{ [key: string]: string | number }> = [];

    useEffect(() => {
        const pf = new PageFlip(document.getElementById('flipbook-container')!, {
            width: 640,
            height: 740,
            minWidth: 470,
            minHeight: 528.75,
            showCover: true,

            drawShadow: true,
            flippingTime: 800,
            startZIndex: 0,
            swipeDistance: 10,
            mobileScrollSupport: true,
            disableFlipByClick: true,
            // useMouseEvents: false,
            clickEventForward: false,
            // usePortrait: false,
            //autoSize: false,
            size: SizeType.STRETCH,
        });

        // const tableOfContent = tableOfContents.flatMap((g) => {
        //     index++;
        //     console.log(g.matter.section);

        //     return g.matter.chapters;
        // });
        // tableOfContents.map((g) => {
        //     AddPagesWithContent(g);
        // });
        foStudy.map((g) => {
            index++;

            g.pagenumber = index;
            AddPagesWithContent(g);
        });
        index++;
        AddFrontPage({ title: 'Koła naukowe na naszej uczelni!' });
        science.map((g) => {
            index++;
            arrayOfSectionsNames = [...arrayOfSectionsNames, { section: g.matter.section, pageNumber: index }];

            AddPagesWithContent(g);
        });
        index++;
        AddFrontPage({ title: 'Nasi Absolwenci' });

        graduate.map((g) => {
            index++;
            arrayOfSectionsNames = [...arrayOfSectionsNames, { section: g.matter.section, pageNumber: index }];
            g.pagenumber = index;

            AddPagesWithContent(g);
        });
        pages.sort((a, b) => a?.changedToMatter.pageNumber - b?.changedToMatter.pageNumber);
        pages.map((p) => {
            index++;
            arrayOfSectionsNames = [...arrayOfSectionsNames, { section: p.changedToMatter.section, pageNumber: index }];

            insertMarkdownPage({ content: p.clean });
        });

        pf.on('changeState', () => {
            setCurrentPage(pf.getCurrentPageIndex());
        });
        pf.loadFromHTML(document.querySelectorAll('.page'));
        setPageFlip(pf);
        setTotalPages(pf.getPageCount());
        // console.log(arrayOfSectionsNames);

        arrayOfSectionsNames = arrayOfSectionsNames.filter(
            (value, index, self) => index === self.findIndex((t) => t.section === value.section),
        );

        setTableOfContentArray(arrayOfSectionsNames);
        // console.log(arrayOfSectionsNames);
        return () => {
            pf.destroy();
        };
    }, []);
    useEffect(() => {
        let page = document.querySelector('page');
    }, [currentPage]);

    useEffect(() => {
        if (pageFlip) {
            setCurrentPage(parseInt(router.query.page as string));
        }
    }, [router.query.page, pageFlip]);

    useEffect(() => {
        if (pageFlip) {
            pageFlip.turnToPage(currentPage);
        }
    }, [currentPage, pageFlip]);

    const nextPage = () => {
        const performTurn = currentPage + 2 > (pageFlip?.getPageCount() || 2) ? false : true;
        if (performTurn) {
            pageFlip?.turnToNextPage();
            setCurrentPage(pageFlip?.getCurrentPageIndex() || currentPage);
            router.push(`/?page=${pageFlip!.getCurrentPageIndex()}`);
        }
    };
    const prevPage = () => {
        const performTurn = currentPage - 2 < 0 ? false : true;
        if (performTurn) {
            pageFlip?.turnToPrevPage();
            setCurrentPage(pageFlip?.getCurrentPageIndex() || currentPage);
            router.push(`/?page=${pageFlip!.getCurrentPageIndex()}`);
        } else router.push(`/?page=0`);
    };

    return (
        <Wrapper>
            {/* {console.log(tableOfContentArray)} */}
            <div id="flipbook-container">
                <div className="page page-cover" data-density="hard">
                    <h1>
                        <LogoPB src="/images/logo_PB.png" />
                    </h1>
                </div>
                <div id="page-storage"></div>
                <div className="page page-cover page-cover-bottom" data-density="hard">
                    <div className="page-content"></div>
                </div>
            </div>
            <div className="flex flex-row relative mt-0 " id="page-counter">
                <div className="flex flex-row justify-center">
                    <Btn onClick={prevPage} className="mr-4" id="prev">
                        <Chevron className="rotate-180" color="white" />
                    </Btn>
                    <div className="flex flex-row gap-1 mt-6">
                        Strona <div id="page-current">{currentPage}</div> z <div id="page-total">{totalPages}</div>
                    </div>
                    <Btn onClick={nextPage} className="ml-4" id="next">
                        <Chevron className="" color="white" />
                    </Btn>
                </div>
            </div>
            <TableOfContents tableOfContentsArray={tableOfContentArray} />
        </Wrapper>
    );
};
