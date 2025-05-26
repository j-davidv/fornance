import React, { useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import { DocumentArrowDownIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import type { Expense } from '../types';

const ExportReport = () => {
  const { expenses, cashBalance } = useStore();
  const reportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const calculateExpenseAmount = (expense: Expense) => {
    if (expense.isPercentage && typeof expense.baseAmount === 'number') {
      return (expense.baseAmount * expense.amount) / 100;
    }
    return expense.amount;
  };

  const renderToCanvas = () => {
    if (!reportRef.current || !canvasRef.current || expenses.length === 0) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size to match the report element
    const reportRect = reportRef.current.getBoundingClientRect();
    canvas.width = reportRect.width * 2; // For better resolution
    canvas.height = reportRect.height * 2;
    ctx.scale(2, 2);

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text styles
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';

    // Draw title
    ctx.fillText('Expense Report', canvas.width / 4, 40);

    // Draw date
    ctx.font = '14px Arial';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, canvas.width / 4, 60);

    // Draw summary section
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(32, 80, canvas.width / 2 - 64, 120);

    // Draw summary content
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText('Summary', 48, 108);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('Current Balance', 48, 140);
    ctx.fillText('Total Expenses', canvas.width / 4, 140);

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#22C55E';
    ctx.fillText(
      `${cashBalance.currency} ${cashBalance.amount.toLocaleString()}`,
      48,
      164
    );

    const totalExpenses = expenses.reduce(
      (acc, expense) => acc + calculateExpenseAmount(expense),
      0
    );

    ctx.fillStyle = '#EF4444';
    ctx.fillText(
      `${cashBalance.currency} ${totalExpenses.toLocaleString()}`,
      canvas.width / 4,
      164
    );

    // Draw expenses section
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(32, 220, canvas.width / 2 - 64, expenses.length * 80 + 60);

    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Expense Details', 48, 248);

    // Draw expenses
    let yOffset = 280;
    expenses.forEach((expense) => {
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(expense.title, 48, yOffset);

      ctx.font = '14px Arial';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(
        `${expense.category} • ${formatDate(expense.date)}`,
        48,
        yOffset + 20
      );

      ctx.textAlign = 'right';
      if (expense.isPercentage && typeof expense.baseAmount === 'number') {
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(
          `${expense.amount}% of ${cashBalance.currency} ${expense.baseAmount.toLocaleString()}`,
          canvas.width / 2 - 80,
          yOffset
        );

        ctx.font = '14px Arial';
        ctx.fillStyle = '#22C55E';
        ctx.fillText(
          `≈ ${cashBalance.currency} ${calculateExpenseAmount(expense).toLocaleString()}`,
          canvas.width / 2 - 80,
          yOffset + 20
        );
      } else {
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(
          `${cashBalance.currency} ${expense.amount.toLocaleString()}`,
          canvas.width / 2 - 80,
          yOffset
        );
      }

      ctx.textAlign = 'left';
      yOffset += 80;
    });

    return canvas;
  };

  const exportAsPDF = async () => {
    if (!reportRef.current || expenses.length === 0) return;

    try {
      toast.loading('Generating PDF...');
      const canvas = renderToCanvas();
      if (!canvas) {
        throw new Error('Failed to generate report');
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('fornance-report.pdf');
      toast.dismiss();
      toast.success('PDF exported successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export PDF');
      console.error('Error exporting PDF:', error);
    }
  };

  const exportAsImage = async () => {
    if (!reportRef.current || expenses.length === 0) return;

    try {
      toast.loading('Generating image...');
      const canvas = renderToCanvas();
      if (!canvas) {
        throw new Error('Failed to generate report');
      }

      const link = document.createElement('a');
      link.download = 'fornance-report.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.dismiss();
      toast.success('Image exported successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export image');
      console.error('Error exporting image:', error);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <button
          onClick={exportAsPDF}
          disabled={expenses.length === 0}
          className="btn btn-primary btn-sm md:btn-md gap-1.5 w-full sm:w-auto"
        >
          <DocumentArrowDownIcon className="w-4 h-4" />
          <span className="whitespace-nowrap">Export PDF</span>
        </button>
        <button
          onClick={exportAsImage}
          disabled={expenses.length === 0}
          className="btn btn-primary btn-sm md:btn-md gap-1.5 w-full sm:w-auto"
        >
          <PhotoIcon className="w-4 h-4" />
          <span className="whitespace-nowrap">Export Image</span>
        </button>
      </div>

      {/* Hidden canvas for rendering */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      {/* Report Template - Only for display */}
      <div ref={reportRef} className="overflow-x-hidden">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-background">
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold mb-2 text-foreground">
              Expense Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="glass-morphism p-4">
            <h2 className="text-base md:text-lg font-semibold mb-3 text-foreground">Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-lg font-semibold text-success">
                  {cashBalance.currency} {cashBalance.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-lg font-semibold text-error">
                  {cashBalance.currency} {expenses.reduce((acc, expense) => acc + calculateExpenseAmount(expense), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-morphism p-4">
            <h2 className="text-base md:text-lg font-semibold mb-3 text-foreground">
              Expense Details
            </h2>
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div 
                  key={expense.id} 
                  className="glass-morphism p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                >
                  <div>
                    <p className="font-medium text-sm md:text-base text-foreground">{expense.title}</p>
                    <div className="text-xs text-muted-foreground flex gap-2">
                      <span>{expense.category}</span>
                      <span>•</span>
                      <span>{formatDate(expense.date)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {expense.isPercentage && typeof expense.baseAmount === 'number' ? (
                      <>
                        <p className="font-medium text-sm text-foreground">
                          {expense.amount}% of {cashBalance.currency} {expense.baseAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-success">
                          ≈ {cashBalance.currency} {calculateExpenseAmount(expense).toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <p className="font-medium text-sm text-foreground">
                        {cashBalance.currency} {expense.amount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportReport; 