import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Image,
  Video,
  Calendar,
  Tag,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { useAdminContent } from '@/hooks/useAdminContent';

const ContentModerationPanel = () => {
  const { content, loading, approveContent, rejectContent } = useAdminContent();
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [moderationNotes, setModerationNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const filteredContent = content.filter(item => {
    if (filterStatus === 'all') return true;
    return item.approval_status === filterStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      entertainment: 'bg-purple-100 text-purple-800',
      news: 'bg-blue-100 text-blue-800',
      lifestyle: 'bg-pink-100 text-pink-800',
      sports: 'bg-green-100 text-green-800',
      technology: 'bg-indigo-100 text-indigo-800',
      fashion: 'bg-rose-100 text-rose-800',
      food: 'bg-orange-100 text-orange-800',
      travel: 'bg-teal-100 text-teal-800',
      education: 'bg-amber-100 text-amber-800',
      business: 'bg-slate-100 text-slate-800',
      health: 'bg-emerald-100 text-emerald-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const handleApprove = async (id: string) => {
    try {
      await approveContent(id, moderationNotes);
    } catch (error) {
      // Optionally show a toast or error message here
      console.error("Failed to approve content", error);
    } finally {
      setModerationNotes('');
      setSelectedContent(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      await rejectContent(id, rejectionReason, moderationNotes);
    } catch (error) {
      // Optionally show a toast or error message here
      console.error("Failed to reject content", error);
    } finally {
      setRejectionReason('');
      setModerationNotes('');
      setSelectedContent(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading content for moderation...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Content Moderation Panel
          </CardTitle>
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredContent.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No content found for the selected filter
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                {/* Content Preview */}
                <div className="aspect-video bg-gray-100 relative">
                  {item.content_type === 'image' ? (
                    <img
                      src={item.file_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.file_url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className={`${getStatusColor(item.approval_status)} text-white`}>
                      {getStatusIcon(item.approval_status)}
                      <span className="ml-1 capitalize">{item.approval_status}</span>
                    </Badge>
                  </div>
                  {/* Content Type Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">
                      {item.content_type === 'image' ? (
                        <Image className="w-3 h-3 mr-1" />
                      ) : (
                        <Video className="w-3 h-3 mr-1" />
                      )}
                      {item.content_type}
                    </Badge>
                  </div>
                </div>
                {/* Content Info */}
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-2 truncate">{item.title}</h3>
                  {/* Category */}
                  <div className="mb-2">
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                  </div>
                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {/* Stats */}
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {item.view_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {/* File Size Info */}
                  <div className="text-xs text-gray-500 mb-3">
                    Size: {item.file_size ? (item.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}
                    {item.content_hash && (
                      <div className="truncate">Hash: {item.content_hash.slice(0, 16)}...</div>
                    )}
                  </div>
                  {/* Rejection Reason */}
                  {item.approval_status === 'rejected' && item.rejection_reason && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
                      <strong>Rejection Reason:</strong> {item.rejection_reason}
                    </div>
                  )}
                  {/* Actions */}
                  {item.approval_status === 'pending' && (
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 flex-1"
                            onClick={() => setSelectedContent(item)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Approve Content</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p>Are you sure you want to approve "{item.title}"?</p>
                            <Textarea
                              placeholder="Optional moderation notes..."
                              value={moderationNotes}
                              onChange={(e) => setModerationNotes(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleApprove(item.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve & Publish
                              </Button>
                              <Button variant="outline" onClick={() => setSelectedContent(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => setSelectedContent(item)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Content</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p>Why are you rejecting "{item.title}"?</p>
                            <Select value={rejectionReason} onValueChange={setRejectionReason}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rejection reason" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                                <SelectItem value="poor_quality">Poor Quality</SelectItem>
                                <SelectItem value="copyright_violation">Copyright Violation</SelectItem>
                                <SelectItem value="spam">Spam</SelectItem>
                                <SelectItem value="misleading">Misleading Information</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <Textarea
                              placeholder="Additional notes (optional)..."
                              value={moderationNotes}
                              onChange={(e) => setModerationNotes(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleReject(item.id)}
                                variant="destructive"
                                disabled={!rejectionReason}
                              >
                                Reject Content
                              </Button>
                              <Button variant="outline" onClick={() => setSelectedContent(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                  {item.approval_status === 'approved' && (
                    <Badge className="w-full bg-green-500 text-white justify-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Published
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentModerationPanel;
