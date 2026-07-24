import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Event, EventStatus } from '../types/event';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from './ui';
import { MapPin, Users, Tag, Image as ImageIcon } from 'lucide-react';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  location: z.string().min(1, 'Location is required').max(200, 'Location must be less than 200 characters'),
  maxAttendees: z.number().min(1, 'Max attendees must be at least 1').max(10000, 'Max attendees must be less than 10000'),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

type FormEventFormData = z.infer<typeof eventSchema>;

export const EventForm: React.FC<EventFormProps> = ({
  event,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(event?.tags || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<FormEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      startDate: event?.startDate || '',
      endDate: event?.endDate || '',
      location: event?.location || '',
      maxAttendees: event?.maxAttendees || 50,
      tags: event?.tags || [],
      imageUrl: event?.imageUrl || ''
    }
  });

  useEffect(() => {
    if (event) {
      reset(event);
      setTags(event.tags || []);
    }
  }, [event, reset]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFormSubmit = async (data: FormEventFormData) => {
    const formData = { ...data, tags };
    await onSubmit(formData);
  };

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {event ? 'Edit Event' : 'Create New Event'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <Input
              {...register('title')}
              placeholder="Enter event title"
              error={errors.title?.message}
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe your event..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <Input
                {...register('startDate')}
                type="text"
                error={errors.startDate?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <Input
                {...register('endDate')}
                type="text"
                error={errors.endDate?.message}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 text-gray-400" />
              <Input
                {...register('location')}
                placeholder="Event location"
                error={errors.location?.message}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Max Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Attendees *
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 h-4 w-4 text-gray-400" />
              <Input
                {...register('maxAttendees', { valueAsNumber: true })}
                type="number"
                placeholder="Maximum number of attendees"
                error={errors.maxAttendees?.message}
                className="pl-10 w-full"
                min="1"
                max="10000"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="space-y-2">
              {/* Tag Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tags (press Enter)"
                    className="pl-10 w-full"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                  variant="outline"
                  size="sm"
                >
                  Add
                </Button>
              </div>
              
              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Image URL
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 text-gray-400" />
              <Input
                {...register('imageUrl')}
                placeholder="https://example.com/image.jpg"
                error={errors.imageUrl?.message}
                className="pl-10 w-full"
              />
            </div>
            {watch('imageUrl') && (
              <div className="mt-2">
                <img
                  src={watch('imageUrl')}
                  alt="Event preview"
                  className="h-32 w-full object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
