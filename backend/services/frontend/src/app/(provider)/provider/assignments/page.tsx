'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

export default function ProviderAssignments() {
  const queryClient = useQueryClient();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['provider-assignments'],
    queryFn: async () => {
      const res = await apiClient.get('/api/dispatch/assignments');
      return res.data;
    },
    refetchInterval: 5000 // Poll every 5s for new dispatch offers
  });

  const acceptMutation = useMutation({
    mutationFn: (assignmentId: string) => apiClient.post(`/api/dispatch/assignments/${assignmentId}/accept`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['provider-assignments'] })
  });

  if (isLoading) return <div>Scanning for jobs...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {assignments?.map((job: any) => (
        <div key={job.id} className="p-4 border border-border rounded-xl bg-card">
          <h3 className="font-bold">{job.type} Delivery</h3>
          <p>Payout: ₹{job.payout}</p>
          <p>Distance: {job.distance}km</p>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => acceptMutation.mutate(job.id)} className="bg-success">Accept Job</Button>
            <Button variant="outline" className="text-destructive">Decline</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
