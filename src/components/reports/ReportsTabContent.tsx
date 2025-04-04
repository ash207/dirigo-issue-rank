
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IssueReportsTable } from "./IssueReportsTable";
import { PositionReportsTable } from "./PositionReportsTable";
import { IssueReport, PositionReport } from "@/hooks/useReports";

interface IssueReportsTabContentProps {
  reports: IssueReport[];
  isLoading: boolean;
}

export const IssueReportsTabContent = ({ reports, isLoading }: IssueReportsTabContentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue Reports</CardTitle>
        <CardDescription>
          Reports submitted by users for inappropriate issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <IssueReportsTable reports={reports} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};

interface PositionReportsTabContentProps {
  reports: PositionReport[];
  isLoading: boolean;
}

export const PositionReportsTabContent = ({ reports, isLoading }: PositionReportsTabContentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Position Reports</CardTitle>
        <CardDescription>
          Reports submitted by users for inappropriate positions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PositionReportsTable reports={reports} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};
