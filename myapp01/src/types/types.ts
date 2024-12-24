export interface IssueListProps {
   data: Data | null;
   setData: React.Dispatch<React.SetStateAction<Data | null>>;
   mappedGraphButtons?: GraphButton[];
}

export interface GraphButton {
   name: string;
   onClick: (name: string) => void;
}

export interface Data {
   subject_type: string;
   issues: Issue[];
}

export interface Issue {
   name: string;
   description: string;
   probability: number;
}

export interface GraphProps {
   data: Data | null,
   currentGraph: string
}
