import React, { useState } from 'react';
import { useStudent } from '../../context/StudentProvider';
import MainLayout from '../../layouts/MainLayout';

// ── Static data (replace with real API data later) ──
const feeBreakdown = [
  { id: 1, name: "Tuition Fees", desc: "Core Academic Program", amount: 1800.00, due: "Oct 15, 2024", icon: "menu_book", bg: "bg-primary-fixed text-primary" },
  { id: 2, name: "Library Membership", desc: "Annual Access & Resource Fund", amount: 350.00, due: "Oct 15, 2024", icon: "local_library", bg: "bg-secondary-fixed text-secondary" },
  { id: 3, name: "Science Lab Fee", desc: "Laboratory Equipment & Materials", amount: 300.00, due: "Oct 15, 2024", icon: "science", bg: "bg-tertiary-fixed text-tertiary" },
];



const transactionHistory = [
  { id: 1, name: "Registration Fee", method: "Paid via Credit Card", date: "Aug 12, 2024", txn: "TXN-9021", amount: 500.00, status: "paid" },
  { id: 2, name: "Uniform Deposit", method: "Bank Transfer", date: "Aug 05, 2024", txn: "TXN-8842", amount: 150.00, status: "paid" },
  { id: 3, name: "Sports Equipment", method: "Awaiting Settlement", date: "Jul 28, 2024", txn: "TXN-8711", amount: 200.00, status: "pending" },
  { id: 4, name: "Tuition Fees - Q1", method: "Paid via Net Banking", date: "Jul 02, 2024", txn: "TXN-8590", amount: 1800.00, status: "paid" },
  { id: 5, name: "Lab Equipment Fee", method: "Paid via Credit Card", date: "Jun 18, 2024", txn: "TXN-8401", amount: 300.00, status: "paid" },
  { id: 6, name: "Annual Day Contribution", method: "Cash Payment", date: "Jun 05, 2024", txn: "TXN-8255", amount: 100.00, status: "paid" },
];

const outstandingBalance = feeBreakdown.reduce((sum, f) => sum + f.amount, 0);

function FullLedgerModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/10 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Full Transaction Ledger</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">{transactionHistory.length} transactions on record</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-surface-container-low text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {transactionHistory.map(t => (
            <div key={t.id} className="flex items-start justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors border border-outline-variant/5">
              <div className="flex gap-3">
                <div className={`p-2 rounded shrink-0 ${t.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  <span className="material-symbols-outlined text-base">{t.status === 'paid' ? 'check_circle' : 'pending'}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">{t.name}</p>
                  <p className="text-xs text-on-surface-variant">{t.method}</p>
                  <p className="text-2xs text-slate-400 mt-1">{t.date} &bull; #{t.txn}</p>
                </div>
              </div>
              <p className={`text-sm font-bold whitespace-nowrap ${t.status === 'paid' ? 'text-green-700' : 'text-amber-600'}`}>
                {t.status === 'paid' ? '+' : '-'}${t.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-outline-variant/10 flex justify-between items-center shrink-0 bg-surface-container-low/30">
          <p className="text-xs text-on-surface-variant">Total Paid: <span className="font-bold text-green-700">${transactionHistory.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0).toFixed(2)}</span></p>
          <button onClick={onClose} className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeesPayments() {
   const { profile, dashboard } = useStudent();
  const [showLedger, setShowLedger] = useState(false);
  const [downloading, setDownloading] = useState(false);
// const { dashboard, profile } = useStudent();
// console.log('dashboard:', dashboard);
// console.log('profile:', profile);
  // ── Generate and print/download invoice ──
  const firstName = profile?.first_name 
  || dashboard?.dashboardRaw?.student?.name?.split(' ')[0] 
  || 'Student';

const studentName = dashboard?.dashboardRaw?.student?.name || 'Student';
const studentId = dashboard?.dashboardRaw?.student?.enrollment_number || 'N/A';

const hasPending = transactionHistory.some(t => t.status === 'pending');
const pendingCount = transactionHistory.filter(t => t.status === 'pending').length;
const nearestDue = feeBreakdown.map(f => f.due).sort()[0];

    const getInsight = () => {
  if (outstandingBalance === 0)
    return { icon: 'check_circle', text: `${firstName}, all fees are cleared! You're in good financial standing.` };
  if (hasPending)
    return { icon: 'pending', text: `${firstName}, you have ${pendingCount} pending transaction${pendingCount > 1 ? 's' : ''} awaiting settlement. Follow up with the finance office.` };
  return { icon: 'lightbulb', text: `${firstName}, your next payment of $${outstandingBalance.toFixed(2)} is due by ${nearestDue}. Pay early to avoid late fees.` };
};
const insight = getInsight();

  const downloadInvoice = () => {
    setDownloading(true);
    const printWindow = window.open('', '_blank');
    const invoiceDate = new Date().toLocaleDateString();
    const invoiceNo = `INV-${Date.now().toString().slice(-8)}`;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceNo}</title>
        <meta charset="UTF-8">
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; background:#fff; padding:40px; color:#333; }
          .container { max-width:800px; margin:0 auto; }
          .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #3b82f6; padding-bottom:20px; margin-bottom:30px; }
          .header h1 { font-size:26px; color:#1e293b; }
          .header p { font-size:12px; color:#94a3b8; margin-top:4px; }
          .invoice-meta { text-align:right; font-size:12px; color:#64748b; }
          .invoice-meta strong { color:#1e293b; }
          .bill-to { background:#f8fafc; padding:16px 20px; border-radius:10px; margin-bottom:24px; }
          .bill-to p { font-size:13px; color:#475569; margin-top:4px; }
          .bill-to .name { font-size:16px; font-weight:700; color:#1e293b; }
          table { width:100%; border-collapse:collapse; margin-bottom:24px; }
          th { background:#f1f5f9; padding:10px 14px; text-align:left; font-size:11px; font-weight:700; color:#475569; text-transform:uppercase; border-bottom:2px solid #e2e8f0; }
          td { padding:12px 14px; font-size:13px; border-bottom:1px solid #e2e8f0; }
          .text-right { text-align:right; }
          .total-row td { font-weight:700; font-size:15px; background:#f8fafc; }
          .footer { margin-top:30px; padding-top:16px; border-top:1px solid #e2e8f0; text-align:center; font-size:11px; color:#94a3b8; }
          .status { display:inline-block; padding:4px 12px; border-radius:20px; background:#fef3c7; color:#92400e; font-weight:700; font-size:11px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <h1>INVOICE</h1>
              <p>ScholarFlow Academic Management System</p>
            </div>
            <div class="invoice-meta">
              <p>Invoice No: <strong>${invoiceNo}</strong></p>
              <p>Date: <strong>${invoiceDate}</strong></p>
              <p>Status: <span class="status">Pending</span></p>
            </div>
          </div>

          <div class="bill-to">
            <p class="name">${studentName}</p>
            <p>Student ID: ${studentId}</p>
            <p>Academic Year: Fall Semester 2024</p>
          </div>

          <table>
            <thead>
              <tr><th>Description</th><th>Category</th><th class="text-right">Amount</th><th class="text-right">Due Date</th></tr>
            </thead>
            <tbody>
              ${feeBreakdown.map(f => `
                <tr>
                  <td><strong>${f.name}</strong></td>
                  <td>${f.desc}</td>
                  <td class="text-right">$${f.amount.toFixed(2)}</td>
                  <td class="text-right">${f.due}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="2">Total Outstanding Balance</td>
                <td class="text-right" colspan="2">$${outstandingBalance.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>This is a system-generated invoice. Generated on ${new Date().toLocaleString()}</p>
            <p>For queries, contact the school finance office.</p>
          </div>
        </div>
        <script>window.print(); setTimeout(() => { window.close(); }, 500);</script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <MainLayout title="Financials">
      {showLedger && <FullLedgerModal onClose={() => setShowLedger(false)} />}

      {/* Full height, no page scroll */}
      <div className="p-4 md:p-5 h-full overflow-hidden">
        <div className="grid grid-cols-12 gap-4 h-full">

          {/* LEFT COLUMN */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 h-full min-h-0">

            {/* Balance hero — shrink-0 */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-container rounded-xl px-6 py-5 text-on-primary shadow-xl flex justify-between items-center shrink-0">
              <div className="relative z-10">
                <p className="text-primary-fixed text-xs font-semibold mb-0.5 uppercase tracking-widest opacity-80">Outstanding Balance</p>
                <h2 className="text-3xl font-extrabold font-headline leading-none">${outstandingBalance.toFixed(2)}</h2>
                <div className="mt-3 flex gap-2.5">
                  <button className="bg-surface-container-lowest text-primary px-5 py-2 rounded-md font-bold text-xs hover:bg-opacity-90 transition-all active:scale-95">
                    Pay Now
                  </button>
                  <button
                    onClick={downloadInvoice}
                    disabled={downloading}
                    className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-md font-semibold text-xs hover:bg-white/20 transition-all disabled:opacity-60 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    {downloading ? 'Preparing...' : 'Download Invoice'}
                  </button>
                </div>
              </div>

              <div className="hidden md:block bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 rotate-3">
                <p className="text-white text-3xs font-bold uppercase mb-1 opacity-80">Status</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-white font-bold text-xs">Action Required</span>
                </div>
              </div>

              <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
            </section>

            {/* Breakdown table — flex-1, internal scroll */}
            <section className="flex-1 bg-surface-container-lowest rounded-xl p-5 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h3 className="text-base font-bold font-headline">Academic Year Breakdown</h3>
                <span className="text-2xs font-semibold text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">
                  Fall Semester 2024
                </span>
              </div>

              <div className="grid grid-cols-12 text-3xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-1.5 shrink-0">
                <div className="col-span-6">Description</div>
                <div className="col-span-3 text-right">Amount</div>
                <div className="col-span-3 text-right">Due Date</div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                {feeBreakdown.map(f => (
                  <div key={f.id} className="group bg-surface-container-low hover:bg-surface-container-high transition-colors p-3 rounded-md grid grid-cols-12 items-center">
                    <div className="col-span-6 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${f.bg}`}>
                        <span className="material-symbols-outlined text-base">{f.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{f.name}</p>
                        <p className="text-xs text-on-surface-variant">{f.desc}</p>
                      </div>
                    </div>
                    <div className="col-span-3 text-right font-headline font-bold text-sm">${f.amount.toFixed(2)}</div>
                    <div className="col-span-3 text-right text-xs text-slate-500">{f.due}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-full min-h-0">

            {/* Insight — shrink-0 */}
            <section className="bg-tertiary text-on-tertiary rounded-xl p-4 shadow-lg shadow-tertiary/10 shrink-0">
              <div className="flex items-center gap-2 mb-2">
               <span className="material-symbols-outlined text-lg">{insight.icon}</span>
<h4 className="font-bold text-xs tracking-tight">Financial Insight</h4>
</div>
<p className="text-xs leading-relaxed opacity-90">{insight.text}</p>
            </section>

            {/* Recent History — flex-1, internal scroll */}
            <section className="flex-1 bg-surface-container-lowest rounded-xl p-4 flex flex-col min-h-0">
              <h3 className="text-sm font-bold font-headline mb-3 shrink-0">Recent History</h3>

              <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1">
                {transactionHistory.slice(0, 4).map(t => (
                  <div key={t.id} className="flex items-start justify-between p-2.5 rounded-md hover:bg-surface-container transition-colors">
                    <div className="flex gap-2.5">
                      <div className={`p-1.5 rounded shrink-0 ${t.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                        <span className="material-symbols-outlined text-sm">{t.status === 'paid' ? 'check_circle' : 'pending'}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface">{t.name}</p>
                        <p className="text-2xs text-on-surface-variant">{t.method}</p>
                        <p className="text-3xs text-slate-400 mt-0.5">{t.date} &bull; #{t.txn}</p>
                      </div>
                    </div>
                    <p className={`text-xs font-bold whitespace-nowrap ${t.status === 'paid' ? 'text-green-700' : 'text-amber-600'}`}>
                      {t.status === 'paid' ? '+' : '-'}${t.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowLedger(true)}
                className="w-full mt-3 py-2.5 border border-outline-variant/30 text-on-surface-variant rounded-md text-2xs font-bold uppercase tracking-widest hover:bg-surface-container-low transition-colors shrink-0"
              >
                View Full Ledger
              </button>
            </section>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}