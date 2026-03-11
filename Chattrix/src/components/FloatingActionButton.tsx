import './FloatingActionButton.css';
import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FABProps) {
  return (
    <button className="fab" onClick={onClick} aria-label="New action">
      <Plus size={24} />
    </button>
  );
}
