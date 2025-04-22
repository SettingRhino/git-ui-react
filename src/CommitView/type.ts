export type CommitViewData = {
  title: {
    title?: string;
    value: string;
  };
  message: {
    message?: string;
  };
  committers: {
    committers: {
      title: string;
      date?: string;
      items: { title: string; value: string }[];
      id?: string;
    }[];
  };
  parents: {
    title?: string;
    parents?: string[];
    handleParentClick?: (parentId: string) => void;
  };
};

export type CommitViewClasses = {
  title?: string;
  message?: string;
  committers?: string;
  parents?: string;
};

export type CommitViewType = {
  data?: CommitViewData;
  classes?: CommitViewClasses;
};
