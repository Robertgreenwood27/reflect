import { DocumentEditor } from '../../components/DocumentEditor';
import { useRouter } from 'next/router';

export default function DocumentPage() {
  const router = useRouter();
  const { id } = router.query;

  return <DocumentEditor documentId={id} />;
}