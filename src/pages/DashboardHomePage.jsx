import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faUser } from '@fortawesome/free-solid-svg-icons';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';

export default function DashboardHomePage() {
  const admin = useAuthStore((s) => s.admin);
  const permissions = useAuthStore((s) => s.permissions);

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome, ${admin?.name ?? 'Admin'}`}
        description="Shared foundation is active. Section screens are added through their dedicated implementation prompts."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center gap-2 text-text-primary">
            <FontAwesomeIcon icon={faUser} />
            <h2 className="text-sm font-semibold">Session</h2>
          </div>
          <dl className="grid grid-cols-3 gap-y-2 text-sm">
            <dt className="col-span-1 text-text-muted">Name</dt>
            <dd className="col-span-2 text-text-primary">{admin?.name ?? '—'}</dd>
            <dt className="col-span-1 text-text-muted">Email</dt>
            <dd className="col-span-2 truncate text-text-primary">{admin?.email ?? '—'}</dd>
            <dt className="col-span-1 text-text-muted">Role</dt>
            <dd className="col-span-2">
              {admin?.role ? <Badge tone="primary">{admin.role}</Badge> : '—'}
            </dd>
          </dl>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2 text-text-primary">
            <FontAwesomeIcon icon={faShieldHalved} />
            <h2 className="text-sm font-semibold">Permissions ({permissions.length})</h2>
          </div>
          {permissions.length === 0 ? (
            <p className="text-sm text-text-muted">No permissions reported by the backend.</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {permissions.map((p) => (
                <li key={p}>
                  <Badge tone="neutral">{p}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
