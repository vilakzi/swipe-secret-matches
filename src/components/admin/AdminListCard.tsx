import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { getAdmins, AdminInfo } from "@/utils/admin/getAdmins";

const AdminListCard: React.FC = () => {
  const [admins, setAdmins] = React.useState<AdminInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const allAdmins = await getAdmins();
        setAdmins(allAdmins);
      } catch (err) {
        setError("Failed to load admins.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>
          Admins ({loading ? "..." : admins.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-red-500 mb-2">{error}</div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2}>Loading...</TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.display_name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!loading && admins.length === 0 && !error && (
          <div className="text-sm text-gray-500 mt-2">No admin users found.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminListCard;
