import { Suspense } from 'react';
import ComplaintList from '@/components/ComplaintList';

export default function ComplaintsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Browse Complaints</h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ComplaintList />
    </Suspense>
  );
}
