
export interface ISection {
    id: string;
    title: string;
    name: string;
    content: string;
    order: number;
    paragraph: string;
    template: string;
    background: string;
    style: any;
}
  
export interface IPageData {
    id: string;
    name: string;
    SectionList?: ISection[];
}

