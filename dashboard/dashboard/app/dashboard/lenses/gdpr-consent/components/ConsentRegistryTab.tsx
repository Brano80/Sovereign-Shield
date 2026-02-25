'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  FileText,
  Eye,
  Mail,
  Calendar,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  User,
  MapPin,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ConsentRecord {
  userId: string;
  email: string;
  purpose: string;
  grantedDate: string | null;
  expiresDate: string | null;
  source: string | null;
  status: 'valid' | 'expiring' | 'withdrawn' | 'expired' | 'none';
}

interface ConsentHistory {
  date: string;
  action: 'granted' | 'withdrawn' | 'expired' | 're-consented';
  purpose: string;
  source: string;
  ip: string;
  sealLevel: string;
}

interface UserConsentStatus {
  purpose: string;
  status: 'valid' | 'withdrawn' | 'expired' | 'never_granted' | 'expiring';
  expiresIn?: number; // days
}

const ConsentRegistryTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<ConsentRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Mock data
  const consentRecords: ConsentRecord[] = [
    {
      userId: 'user_9281',
      email: 'user_9281@example.com',
      purpose: 'Marketing',
      grantedDate: 'Today',
      expiresDate: 'Jan 2027',
      source: 'Web Form',
      status: 'valid'
    },
    {
      userId: 'user_8172',
      email: 'user_8172@example.com',
      purpose: 'Analytics',
      grantedDate: 'Dec 15',
      expiresDate: null,
      source: 'App',
      status: 'withdrawn'
    },
    {
      userId: 'user_7623',
      email: 'user_7623@example.com',
      purpose: 'Profiling',
      grantedDate: null,
      expiresDate: null,
      source: null,
      status: 'none'
    },
    {
      userId: 'user_6891',
      email: 'user_6891@example.com',
      purpose: 'Third-Party',
      grantedDate: 'Today',
      expiresDate: 'Jan 2027',
      source: 'Email',
      status: 'valid'
    },
    {
      userId: 'user_5582',
      email: 'user_5582@example.com',
      purpose: 'Marketing',
      grantedDate: 'Nov 20',
      expiresDate: 'Nov 2026',
      source: 'Web Form',
      status: 'valid'
    },
    {
      userId: 'user_5582',
      email: 'user_5582@example.com',
      purpose: 'Analytics',
      grantedDate: 'Nov 20',
      expiresDate: 'Nov 2026',
      source: 'Web Form',
      status: 'valid'
    },
    {
      userId: 'user_4471',
      email: 'user_4471@example.com',
      purpose: 'AI Training',
      grantedDate: 'Oct 15',
      expiresDate: 'Jan 10',
      source: 'App',
      status: 'expiring'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">🟢 Valid</Badge>;
      case 'expiring':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">🟡 Expiring</Badge>;
      case 'withdrawn':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">🔴 Withdrawn</Badge>;
      case 'expired':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">🔴 Expired</Badge>;
      case 'none':
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">⚫ None</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">⚫ None</Badge>;
    }
  };

  const filteredRecords = consentRecords.filter(record => {
    const matchesSearch = !searchQuery ||
      record.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesPurpose = purposeFilter === 'all' || record.purpose === purposeFilter;
    const matchesSource = sourceFilter === 'all' || record.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesPurpose && matchesSource;
  });

  const handleRowClick = (record: ConsentRecord) => {
    setSelectedUser(record);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">● CONSENT REGISTRY</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by user ID, email, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-slate-300"
                />
              </div>
            </div>

            <Select value={purposeFilter} onValueChange={setPurposeFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-slate-300">
                <SelectValue placeholder="All Purposes" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">All Purposes</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Analytics">Analytics</SelectItem>
                <SelectItem value="Profiling">Profiling</SelectItem>
                <SelectItem value="Third-Party">Third-Party</SelectItem>
                <SelectItem value="AI Training">AI Training</SelectItem>
                <SelectItem value="Geolocation">Geolocation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-slate-300">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="expiring">Expiring</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-slate-300">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Web Form">Web Form</SelectItem>
                <SelectItem value="App">App</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Download size={14} className="mr-2" />
              Export CSV
            </Button>

            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <FileText size={14} className="mr-2" />
              Export PDF
            </Button>
          </div>

          {/* Table */}
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300">USER</TableHead>
                  <TableHead className="text-slate-300">PURPOSE</TableHead>
                  <TableHead className="text-slate-300">GRANTED</TableHead>
                  <TableHead className="text-slate-300">EXPIRES</TableHead>
                  <TableHead className="text-slate-300">SOURCE</TableHead>
                  <TableHead className="text-slate-300">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record, index) => (
                  <TableRow
                    key={`${record.userId}-${record.purpose}-${index}`}
                    className="border-slate-700 hover:bg-slate-800/30 cursor-pointer"
                    onClick={() => handleRowClick(record)}
                  >
                    <TableCell className="text-slate-300">
                      <div>
                        <div className="font-medium">{record.email}</div>
                        <div className="text-xs text-slate-500">{record.userId}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{record.purpose}</TableCell>
                    <TableCell className="text-slate-300">{record.grantedDate || '—'}</TableCell>
                    <TableCell className="text-slate-300">{record.expiresDate || '—'}</TableCell>
                    <TableCell className="text-slate-300">{record.source || '—'}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-400">
              Showing 1-25 of {filteredRecords.length}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="border-slate-700 text-slate-500">
                ← Prev
              </Button>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 bg-slate-800">
                1
              </Button>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                2
              </Button>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                ...
              </Button>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Next →
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 text-xs text-slate-400">
            Legend: 🟢 Valid │ 🟡 Expiring │ 🔴 Withdrawn/Expired │ ⚫ No consent
          </div>
        </CardContent>
      </Card>

      {/* User Consent Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Consent Record</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider">User ID</label>
                  <p className="text-slate-300 font-medium">{selectedUser.userId}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider">Email</label>
                  <p className="text-slate-300 font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider">Registered</label>
                  <p className="text-slate-300 font-medium">2024-03-15</p>
                </div>
              </div>

              {/* Consent Status Grid */}
              <div>
                <h3 className="text-lg font-medium mb-4">Consent Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { purpose: 'Marketing', status: 'valid' },
                    { purpose: 'Analytics', status: 'valid' },
                    { purpose: 'Profiling', status: 'withdrawn' },
                    { purpose: 'Third-Party', status: 'never_granted' },
                    { purpose: 'AI Training', status: 'expiring', expiresIn: 12 },
                    { purpose: 'Geolocation', status: 'never_granted' }
                  ].map((consent) => (
                    <div key={consent.purpose} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-300">{consent.purpose}</span>
                        {consent.status === 'valid' && <CheckCircle size={14} className="text-emerald-400" />}
                        {consent.status === 'withdrawn' && <XCircle size={14} className="text-red-400" />}
                        {consent.status === 'expiring' && <AlertTriangle size={14} className="text-yellow-400" />}
                        {consent.status === 'never_granted' && <Clock size={14} className="text-slate-400" />}
                      </div>
                      <div className="text-xs text-slate-400">
                        {consent.status === 'valid' && 'Valid'}
                        {consent.status === 'withdrawn' && 'Withdrawn'}
                        {consent.status === 'expiring' && `Expiring (${consent.expiresIn}d)`}
                        {consent.status === 'never_granted' && 'Never granted'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consent History */}
              <div>
                <h3 className="text-lg font-medium mb-4">Consent History</h3>
                <div className="border border-slate-700 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-800/50 border-slate-700">
                        <TableHead className="text-slate-300">DATE</TableHead>
                        <TableHead className="text-slate-300">ACTION</TableHead>
                        <TableHead className="text-slate-300">PURPOSE</TableHead>
                        <TableHead className="text-slate-300">SOURCE</TableHead>
                        <TableHead className="text-slate-300">IP</TableHead>
                        <TableHead className="text-slate-300">SEAL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { date: 'Jan 07 9:52', action: 'granted', purpose: 'Marketing', source: 'Web Form', ip: '192.168.1.1', seal: 'L2' },
                        { date: 'Dec 20 14:30', action: 'withdrawn', purpose: 'Profiling', source: 'App', ip: '10.0.0.45', seal: 'L2' },
                        { date: 'Nov 15 10:15', action: 'granted', purpose: 'Analytics', source: 'Web Form', ip: '192.168.1.1', seal: 'L2' },
                        { date: 'Nov 15 10:15', action: 'granted', purpose: 'Marketing', source: 'Web Form', ip: '192.168.1.1', seal: 'L2' },
                        { date: 'Oct 01 08:22', action: 'granted', purpose: 'AI Training', source: 'App', ip: '10.0.0.45', seal: 'L2' }
                      ].map((history, index) => (
                        <TableRow key={index} className="border-slate-700">
                          <TableCell className="text-slate-300">{history.date}</TableCell>
                          <TableCell>
                            <Badge className={
                              history.action === 'granted'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }>
                              {history.action === 'granted' ? '🟢 Granted' : '🔴 Withdrew'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300">{history.purpose}</TableCell>
                          <TableCell className="text-slate-300">{history.source}</TableCell>
                          <TableCell className="text-slate-300 font-mono text-xs">{history.ip}</TableCell>
                          <TableCell className="text-slate-300">{history.seal}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  <FileText size={14} className="mr-2" />
                  Export Consent Record
                </Button>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  <Mail size={14} className="mr-2" />
                  Send Re-consent Request
                </Button>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  <Eye size={14} className="mr-2" />
                  View Evidence
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsentRegistryTab;