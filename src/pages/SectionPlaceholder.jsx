import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHammer } from '@fortawesome/free-solid-svg-icons';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';

export default function SectionPlaceholder({ name }) {
  return (
    <PageContainer>
      <PageHeader
        title={name}
        description="This section will be implemented via its dedicated prompt."
      />
      <Card>
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <FontAwesomeIcon icon={faHammer} className="text-2xl text-text-muted" />
          <p className="text-sm text-text-secondary">
            The <span className="font-medium text-text-primary">{name}</span> section is not
            implemented yet in the foundation phase.
          </p>
        </div>
      </Card>
    </PageContainer>
  );
}
