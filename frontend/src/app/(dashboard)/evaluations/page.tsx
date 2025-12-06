"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle,
  Clock,
  CheckCircle,
  Archive,
  Trash2,
  Loader2,
  Send,
  User,
  Calendar
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Evaluation {
  id: string;
  profile_id: string;
  message: string;
  sender_name: string;
  telegram_chat_id?: number;
  status: 'unread' | 'read' | 'archived';
  admin_notes?: string;
  created_at: string;
  read_at?: string;
}

export default function EvaluationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'unread' | 'read' | 'all'>('unread');

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      loadEvaluations();
    }
  }, [profile, activeTab]);

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dapur-umkm/profile`);
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadEvaluations = async () => {
    try {
      setIsLoading(true);
      
      const statusParam = activeTab === 'all' ? '' : `&status=${activeTab}`;
      const res = await fetch(`${API_URL}/api/evaluations?profile_id=${profile.id}${statusParam}`);
      const data = await res.json();
      
      if (data.success) {
        setEvaluations(data.data);
      }
    } catch (error) {
      console.error('Error loading evaluations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/evaluations/${id}/read`, {
        method: 'PUT'
      });
      const data = await res.json();
      
      if (data.success) {
        loadEvaluations();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const saveAdminNotes = async () => {
    if (!selectedEval) return;
    
    try {
      setIsSaving(true);
      
      const res = await fetch(`${API_URL}/api/evaluations/${selectedEval.id}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: adminNotes })
      });
      const data = await res.json();
      
      if (data.success) {
        alert('✅ Catatan berhasil disimpan!');
        loadEvaluations();
        setSelectedEval(null);
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('❌ Gagal menyimpan catatan');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEvaluation = async (id: string) => {
    if (!confirm('Hapus evaluasi ini?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/evaluations/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (data.success) {
        loadEvaluations();
      }
    } catch (error) {
      console.error('Error deleting evaluation:', error);
    }
  };

  const unreadCount = evaluations.filter(e => e.status === 'unread').length;

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-1">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent dark:from-red-500 dark:to-red-400">
              Evaluasi dari Boss
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Pesan evaluasi yang dikirim via Telegram Bot
            </p>
          </div>

          {/* Telegram Info */}
          <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2 text-sm">
                <Send className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 dark:text-blue-400 font-medium">
                  Kode Login Bot: <code className="font-mono bg-white dark:bg-gray-800 px-2 py-0.5 rounded">{profile.id.slice(0, 8)}</code>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'unread'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Belum Dibaca
              {unreadCount > 0 && (
                <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab('read')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'read'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Sudah Dibaca
            </div>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'all'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Semua
            </div>
          </button>
        </div>

        {/* Evaluations List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : evaluations.length === 0 ? (
          <Card className="bg-white dark:bg-gray-900">
            <CardContent className="py-20 text-center">
              <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'unread' ? 'Tidak ada evaluasi baru' : 'Tidak ada evaluasi'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Boss dapat mengirim evaluasi via Telegram Bot dengan kode: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{profile.id.slice(0, 8)}</code>
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {evaluations.map((evaluation) => (
              <Card 
                key={evaluation.id}
                className={`bg-white dark:bg-gray-900 border-l-4 ${
                  evaluation.status === 'unread' 
                    ? 'border-l-red-600' 
                    : 'border-l-gray-300 dark:border-l-gray-700'
                }`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {evaluation.sender_name}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(evaluation.created_at).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          {evaluation.status === 'unread' && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full">
                              BARU
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {evaluation.status === 'unread' && (
                        <Button
                          onClick={() => markAsRead(evaluation.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Tandai Dibaca
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => {
                          setSelectedEval(evaluation);
                          setAdminNotes(evaluation.admin_notes || '');
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Beri Catatan
                      </Button>

                      <Button
                        onClick={() => deleteEvaluation(evaluation.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {evaluation.message}
                    </p>
                  </div>

                  {evaluation.admin_notes && (
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        📝 Catatan Admin:
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        {evaluation.admin_notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Admin Notes Modal */}
        {selectedEval && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white dark:bg-gray-900 max-w-2xl w-full">
              <CardHeader>
                <CardTitle>Beri Catatan Admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Evaluasi dari: <strong>{selectedEval.sender_name}</strong>
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    "{selectedEval.message}"
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Catatan Admin
                  </label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Tambahkan catatan atau response Anda..."
                    rows={5}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => {
                      setSelectedEval(null);
                      setAdminNotes('');
                    }}
                    variant="outline"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={saveAdminNotes}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Simpan Catatan
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
