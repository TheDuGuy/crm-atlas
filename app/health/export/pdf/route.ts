// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const periodType = searchParams.get('period_type') || 'week';
  const date = searchParams.get('date') || '';
  const channels = searchParams.get('channels')?.split(',').filter(Boolean) || [];

  try {
    // Fetch health flags for the period
    let query = supabase
      .from('health_flags')
      .select(`
        *,
        workflow_id,
        product_id
      `)
      .eq('period_type', periodType)
      .eq('period_start_date', date)
      .order('status', { ascending: false }); // Red first

    const { data: flags, error: flagsError } = await query;

    if (flagsError) throw flagsError;

    // Fetch metrics for the period
    let metricsQuery = supabase
      .from('v_latest_health_metrics')
      .select('*')
      .eq('period_type', periodType)
      .eq('period_start_date', date);

    if (channels.length > 0) {
      metricsQuery = metricsQuery.in('channel', channels);
    }

    const { data: metrics, error: metricsError } = await metricsQuery;

    if (metricsError) throw metricsError;

    // Group by product
    const productMap = new Map();

    for (const metric of metrics || []) {
      const productId = metric.product_id || 'unassigned';
      const productName = metric.product_name || 'Unassigned';

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          name: productName,
          workflows: [],
          sends: 0,
          opens: 0,
          clicks: 0,
          redCount: 0,
          amberCount: 0,
        });
      }

      const product = productMap.get(productId);
      product.workflows.push(metric);
      product.sends += metric.sends || 0;
      product.opens += metric.opens || 0;
      product.clicks += metric.clicks || 0;

      // Count red/amber workflows
      const workflowFlags = flags?.filter(
        f => f.workflow_id === metric.workflow_id && f.channel === metric.channel
      ) || [];

      if (workflowFlags.some(f => f.status === 'red')) {
        product.redCount++;
      } else if (workflowFlags.some(f => f.status === 'amber')) {
        product.amberCount++;
      }
    }

    const products = Array.from(productMap.values());

    // Calculate totals
    const totalRed = flags?.filter(f => f.status === 'red').length || 0;
    const totalAmber = flags?.filter(f => f.status === 'amber').length || 0;
    const totalProducts = products.length;
    const redProducts = products.filter(p => p.redCount > 0).length;
    const amberProducts = products.filter(p => p.amberCount > 0 && p.redCount === 0).length;

    // Top watchouts
    const topWatchouts: string[] = [];
    if (totalRed > 0) {
      topWatchouts.push(`${totalRed} workflow metrics in RED status`);
    }

    const complaintFlags = flags?.filter(f => f.metric_name === 'complaint_rate' && f.status !== 'green') || [];
    if (complaintFlags.length > 0) {
      topWatchouts.push(`${complaintFlags.length} workflows with deliverability issues`);
    }

    const biggestDrop = flags
      ?.filter(f => f.metric_name === 'open_rate' && f.delta_wow !== null)
      .sort((a, b) => (a.delta_wow || 0) - (b.delta_wow || 0))[0];

    if (biggestDrop && biggestDrop.delta_wow && biggestDrop.delta_wow < -10) {
      topWatchouts.push(`Biggest open rate drop: ${Math.abs(biggestDrop.delta_wow).toFixed(1)}% WoW`);
    }

    // Generate HTML for PDF/print
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Channel Health Pulse Report - ${date}</title>
          <style>
            @page {
              margin: 20mm;
              size: A4 landscape;
            }

            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .no-print {
                display: none;
              }
              .page-break {
                page-break-after: always;
              }
            }

            body {
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
              line-height: 1.5;
              color: #1e293b;
              max-width: 1400px;
              margin: 0 auto;
              padding: 20px;
            }

            h1 {
              color: #1e40af;
              border-bottom: 3px solid #1e40af;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }

            h2 {
              color: #334155;
              margin-top: 30px;
              margin-bottom: 15px;
            }

            .meta {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
            }

            .meta-item {
              display: flex;
              flex-direction: column;
            }

            .meta-label {
              font-size: 12px;
              color: #64748b;
              text-transform: uppercase;
              font-weight: 600;
            }

            .meta-value {
              font-size: 18px;
              font-weight: 700;
              color: #0f172a;
            }

            .executive-summary {
              background: #f1f5f9;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
            }

            .summary-card {
              text-align: center;
            }

            .summary-number {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 5px;
            }

            .summary-label {
              font-size: 14px;
              color: #64748b;
            }

            .red-text { color: #dc2626; }
            .amber-text { color: #d97706; }
            .green-text { color: #16a34a; }

            .watchouts {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
            }

            .watchouts h3 {
              margin-top: 0;
              color: #92400e;
              font-size: 16px;
            }

            .watchouts ul {
              margin: 10px 0 0 0;
              padding-left: 20px;
            }

            .watchouts li {
              color: #78350f;
              margin-bottom: 5px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 13px;
            }

            th, td {
              border: 1px solid #e2e8f0;
              padding: 10px;
              text-align: left;
            }

            th {
              background-color: #334155;
              color: white;
              font-weight: 600;
            }

            tbody tr:nth-child(even) {
              background-color: #f8fafc;
            }

            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
            }

            .badge-red {
              background: #fee2e2;
              color: #991b1b;
            }

            .badge-amber {
              background: #fef3c7;
              color: #92400e;
            }

            .badge-green {
              background: #d1fae5;
              color: #065f46;
            }

            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #64748b;
              font-size: 12px;
              text-align: center;
            }

            .no-print {
              position: fixed;
              top: 20px;
              right: 20px;
              z-index: 1000;
            }

            .print-btn {
              background: #1e40af;
              color: white;
              padding: 12px 24px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }

            .print-btn:hover {
              background: #1e3a8a;
            }
          </style>
        </head>
        <body>
          <button class="print-btn no-print" onclick="window.print()">📥 Download PDF</button>

          <h1>Channel Health Pulse Report</h1>

          <div class="meta">
            <div class="meta-item">
              <span class="meta-label">Period</span>
              <span class="meta-value">${periodType === 'week' ? 'Weekly' : 'Monthly'} • ${date}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Channels</span>
              <span class="meta-value">${channels.length > 0 ? channels.join(', ') : 'All'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Generated</span>
              <span class="meta-value">${new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <h2>Executive Summary</h2>
          <div class="executive-summary">
            <div class="summary-card">
              <div class="summary-number red-text">${redProducts}</div>
              <div class="summary-label">Red Products</div>
            </div>
            <div class="summary-card">
              <div class="summary-number amber-text">${amberProducts}</div>
              <div class="summary-label">Amber Products</div>
            </div>
            <div class="summary-card">
              <div class="summary-number">${totalProducts}</div>
              <div class="summary-label">Total Products</div>
            </div>
          </div>

          ${topWatchouts.length > 0 ? `
            <div class="watchouts">
              <h3>⚠️ Key Watchouts</h3>
              <ul>
                ${topWatchouts.map(w => `<li>${w}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <h2>Product Performance</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: right;">Workflows</th>
                <th style="text-align: right;">Sends</th>
                <th style="text-align: right;">Open Rate</th>
                <th style="text-align: right;">Click Rate</th>
                <th style="text-align: center;">Red</th>
                <th style="text-align: center;">Amber</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(p => {
                const openRate = p.sends > 0 ? (p.opens / p.sends * 100).toFixed(1) : '-';
                const clickRate = p.sends > 0 ? (p.clicks / p.sends * 100).toFixed(1) : '-';
                return `
                  <tr>
                    <td><strong>${p.name}</strong></td>
                    <td style="text-align: right;">${p.workflows.length}</td>
                    <td style="text-align: right;">${p.sends.toLocaleString()}</td>
                    <td style="text-align: right;">${openRate}%</td>
                    <td style="text-align: right;">${clickRate}%</td>
                    <td style="text-align: center;">${p.redCount > 0 ? `<span class="status-badge badge-red">${p.redCount}</span>` : '-'}</td>
                    <td style="text-align: center;">${p.amberCount > 0 ? `<span class="status-badge badge-amber">${p.amberCount}</span>` : '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated by CRM Atlas Channel Health V2 • ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
