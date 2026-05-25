import { DashboardView } from '@/components/dashboard/dashboard-view'
import { DASHBOARD_MOCK_INTERVIEWS } from '@/components/dashboard/dashboard-mock-data'

export default function DemoDashboardPage() {
  return <DashboardView interviews={DASHBOARD_MOCK_INTERVIEWS} demoMode />
}
