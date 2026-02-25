"use client";

import { useState, useEffect } from "react";
import { WhitelistEntry } from "@/lib/dora/asset-inventory-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle, XCircle, Shield } from "lucide-react";
import { format } from "date-fns";

export function WhitelistTab() {
  const [entries, setEntries] = useState<WhitelistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<WhitelistEntry | null>(null);
  const [showAddVersionDialog, setShowAddVersionDialog] = useState(false);

  useEffect(() => {
    fetchWhitelist();
  }, []);

  const fetchWhitelist = async () => {
    try {
      const response = await fetch("/api/v1/dora/assets?view=whitelist");
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error("Failed to fetch whitelist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-white">Component Whitelist</h4>
          <p className="text-sm text-slate-400">
            Approved software, hardware, and services for deployment
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Component
        </Button>
      </div>

      {/* Whitelist Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-300">Vendor / Product</TableHead>
              <TableHead className="text-slate-300">Category</TableHead>
              <TableHead className="text-slate-300">Approved Versions</TableHead>
              <TableHead className="text-slate-300">Blocked Versions</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300">Next Review</TableHead>
              <TableHead className="text-slate-300"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                  Loading...
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Shield className="h-8 w-8 mx-auto text-slate-500 mb-2" />
                  <p className="text-slate-400">No whitelist entries</p>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id} className="border-slate-800">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{entry.vendor}</p>
                      <p className="text-sm text-slate-500">{entry.product}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-300">{entry.category.replace(/_/g, " ")}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(entry.approvedVersions || []).slice(0, 3).map((v: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                          {v.version}
                        </Badge>
                      ))}
                      {(entry.approvedVersions || []).length > 3 && (
                        <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                          +{(entry.approvedVersions || []).length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(entry.blockedVersions || []).slice(0, 2).map((v: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/20">
                          {v.version}
                        </Badge>
                      ))}
                      {(entry.blockedVersions || []).length > 2 && (
                        <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                          +{(entry.blockedVersions || []).length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      entry.status === "ACTIVE" ? "bg-green-500/10 text-green-400" :
                      entry.status === "DEPRECATED" ? "bg-yellow-500/10 text-yellow-400" :
                      "bg-red-500/10 text-red-400"
                    }>
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-300">
                      {format(new Date(entry.nextReviewDate), "MMM d, yyyy")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEntry(entry);
                        setShowAddVersionDialog(true);
                      }}
                    >
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Manage Versions Dialog */}
      {showAddVersionDialog && selectedEntry && (
        <ManageVersionsDialog
          entry={selectedEntry}
          onClose={() => {
            setShowAddVersionDialog(false);
            setSelectedEntry(null);
          }}
          onUpdate={fetchWhitelist}
        />
      )}
    </div>
  );
}

function ManageVersionsDialog({
  entry,
  onClose,
  onUpdate,
}: {
  entry: WhitelistEntry;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [newVersion, setNewVersion] = useState("");
  const [action, setAction] = useState<"approve" | "block">("approve");
  const [blockReason, setBlockReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/v1/dora/whitelist/${entry.id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: newVersion,
          action,
          reason: action === "block" ? blockReason : undefined,
          approvedBy: "current-user", // From auth context
        }),
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to update versions:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            Manage Versions: {entry.vendor} {entry.product}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current approved versions */}
          <div>
            <Label className="text-sm font-medium text-white">Approved Versions</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(entry.approvedVersions || []).map((v: any, i: number) => (
                <Badge key={i} className="bg-green-500/10 text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {v.version}
                </Badge>
              ))}
              {(entry.approvedVersions || []).length === 0 && (
                <span className="text-sm text-slate-400">No approved versions</span>
              )}
            </div>
          </div>

          {/* Current blocked versions */}
          <div>
            <Label className="text-sm font-medium text-white">Blocked Versions</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(entry.blockedVersions || []).map((v: any, i: number) => (
                <Badge key={i} className="bg-red-500/10 text-red-400">
                  <XCircle className="h-3 w-3 mr-1" />
                  {v.version}
                </Badge>
              ))}
              {(entry.blockedVersions || []).length === 0 && (
                <span className="text-sm text-slate-400">No blocked versions</span>
              )}
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Add new version */}
          <div className="space-y-4">
            <div>
              <Label className="text-white">Version</Label>
              <Input
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                placeholder="e.g., 2.1.0"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="flex gap-4">
              <Button
                variant={action === "approve" ? "default" : "outline"}
                onClick={() => setAction("approve")}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant={action === "block" ? "destructive" : "outline"}
                onClick={() => setAction("block")}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Block
              </Button>
            </div>

            {action === "block" && (
              <div>
                <Label className="text-white">Block Reason</Label>
                <Input
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Reason for blocking this version..."
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!newVersion || (action === "block" && !blockReason) || isSubmitting}
          >
            {action === "approve" ? "Approve Version" : "Block Version"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

