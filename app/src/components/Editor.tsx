import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { getFileContent, saveFileContent, approveListing, unapproveListing } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { Check } from 'lucide-react';

interface EditorProps {
  listingName: string;
  approved: boolean;
  onApprovalChange: () => void;
}

export function Editor({ listingName, approved, onApprovalChange }: EditorProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  // Load content when listing changes
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getFileContent(listingName, 'title.md'),
      getFileContent(listingName, 'price.md'),
      getFileContent(listingName, 'description.md'),
    ]).then(([t, p, d]) => {
      setTitle(t);
      setPrice(p);
      setDescription(d);
      setLoading(false);
    });
  }, [listingName]);

  // Debounced save functions
  const saveTitle = useDebounce(
    useCallback((content: string) => {
      saveFileContent(listingName, 'title.md', content);
    }, [listingName]),
    1000
  );

  const savePrice = useDebounce(
    useCallback((content: string) => {
      saveFileContent(listingName, 'price.md', content);
    }, [listingName]),
    1000
  );

  const saveDescription = useDebounce(
    useCallback((content: string) => {
      saveFileContent(listingName, 'description.md', content);
    }, [listingName]),
    1000
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    saveTitle(value);
  };

  const handlePriceChange = (value: string) => {
    setPrice(value);
    savePrice(value);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    saveDescription(value);
  };

  const handleApprovalToggle = async () => {
    if (approved) {
      await unapproveListing(listingName);
    } else {
      await approveListing(listingName);
    }
    onApprovalChange();
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Listing title..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Price</label>
        <Input
          value={price}
          onChange={e => handlePriceChange(e.target.value)}
          placeholder="$0"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={description}
          onChange={e => handleDescriptionChange(e.target.value)}
          placeholder="Listing description..."
          rows={12}
        />
      </div>

      <Button
        onClick={handleApprovalToggle}
        variant={approved ? 'outline' : 'default'}
        className="w-full"
      >
        {approved ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Approved
          </>
        ) : (
          'Approve'
        )}
      </Button>
    </div>
  );
}
