"use client";
import { useState } from "react";
import { Package, FileText, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

export function EvidencePackagesTab() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const frameworks = [
    { value: "GDPR", label: "GDPR", description: "General Data Protection Regulation" },
    { value: "AI_ACT", label: "AI Act", description: "Artificial Intelligence Act" },
    { value: "DORA", label: "DORA", description: "Digital Operational Resilience Act" },
  ];

  const handleGenerate = async () => {
    if (!selectedFramework || !startDate || !endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setIsGenerating(true);

    try {
      // Use fetch directly to handle binary response
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8080/api/v1/evidence/generate-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          framework: selectedFramework,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Create blob from response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Extract filename from Content-Disposition header or create default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'nexus-evidence-package.zip';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Evidence Package & Nexus Seal Certificate generated.", {
        duration: 5000,
        description: `File: ${filename}`,
      });

      setIsOpen(false);
      setSelectedFramework("");
      setStartDate("");
      setEndDate("");
    } catch (error) {
      console.error("Failed to generate evidence package:", error);
      toast.error("Failed to generate evidence package. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Package className="text-emerald-400" size={20} />
            Evidence Packages
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Generate cryptographically sealed evidence packages for regulatory compliance
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <FileText className="mr-2 h-4 w-4" />
              Generate Package
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="text-emerald-400" size={20} />
                Generate Evidence Package
              </DialogTitle>
              <DialogDescription>
                Create a cryptographically sealed evidence package for regulatory submission.
                All events will be verified for integrity before inclusion.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Framework Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Regulatory Framework
                </label>
                <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select framework..." />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks.map((framework) => (
                      <SelectItem key={framework.value} value={framework.value}>
                        <div>
                          <div className="font-medium">{framework.label}</div>
                          <div className="text-xs text-slate-400">{framework.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 rounded-md border border-amber-800/50 bg-amber-950/20 p-3">
                <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-200">
                  <p className="font-medium">Regulatory Compliance</p>
                  <p className="text-amber-300">
                    Only events with verified cryptographic seals will be included in the package.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedFramework || !startDate || !endDate}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isGenerating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sealing Evidence...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Generate Package
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Package Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {frameworks.map((framework) => (
          <div
            key={framework.value}
            className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/10 p-2">
                <FileText className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">{framework.label}</h4>
                <p className="text-sm text-slate-400">{framework.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Packages Placeholder */}
      <div className="rounded-lg border border-slate-800 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Recent Packages</h4>
        <div className="text-center py-8 text-slate-400">
          <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No packages generated yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Generated packages will appear here for download and management
          </p>
        </div>
      </div>
    </div>
  );
}
