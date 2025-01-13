// frontend/src/components/OwnerDashboard/ManageTenants/Reports.js
import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from "../../../contexts/ThemeContext";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { fetchTenantList } from '../../../global/api/Tenants';
import { fetchPayments } from '../../../global/api/Payments';
import { fetchLandlordMaintenanceRequests } from '../../../global/api/Maintenance';

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
  },
  section: {
    margin: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 25,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1,
    padding: 5,
  },
});

const Reports = () => {
  const { darkMode } = useContext(ThemeContext);
  const [reportType, setReportType] = useState('rent');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to generate report data
  const generateReportData = async () => {
    setLoading(true);
    try {
      let data;
      switch (reportType) {
        case 'rent':
          const payments = await fetchPayments();
          data = payments.filter(payment => {
            const paymentDate = new Date(payment.paymentDate);
            return paymentDate >= new Date(dateRange.start) &&
                   paymentDate <= new Date(dateRange.end);
          });
          break;
        case 'maintenance':
          const maintenance = await fetchLandlordMaintenanceRequests();
          data = maintenance.filter(request => {
            const requestDate = new Date(request.createdAt);
            return requestDate >= new Date(dateRange.start) &&
                   requestDate <= new Date(dateRange.end);
          });
          break;
        case 'occupancy':
          const tenants = await fetchTenantList();
          data = tenants.filter(tenant => {
            const moveInDate = new Date(tenant.movedInDate);
            return moveInDate >= new Date(dateRange.start) &&
                   moveInDate <= new Date(dateRange.end);
          });
          break;
        default:
          data = [];
      }
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    }
    setLoading(false);
  };

  // PDF Document Component
  const ReportDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>
            {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
          </Text>
          <Text style={styles.text}>
            Period: {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
          </Text>
          
          {reportData && reportData.length > 0 ? (
            <View style={styles.table}>
              {/* Table Headers */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                {reportType === 'rent' && (
                  <>
                    <Text style={styles.tableCell}>Date</Text>
                    <Text style={styles.tableCell}>Tenant</Text>
                    <Text style={styles.tableCell}>Amount</Text>
                    <Text style={styles.tableCell}>Status</Text>
                  </>
                )}
                {/* Add similar header structures for other report types */}
              </View>
              
              {/* Table Data */}
              {reportData.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  {reportType === 'rent' && (
                    <>
                      <Text style={styles.tableCell}>
                        {new Date(item.paymentDate).toLocaleDateString()}
                      </Text>
                      <Text style={styles.tableCell}>
                        {`${item.tenantId.seekerId.info.firstName} ${item.tenantId.seekerId.info.lastName}`}
                      </Text>
                      <Text style={styles.tableCell}>${item.paidAmount}</Text>
                      <Text style={styles.tableCell}>{item.status}</Text>
                    </>
                  )}
                  {/* Add similar data structures for other report types */}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.text}>No data available for the selected period.</Text>
          )}
        </View>
      </Page>
    </Document>
  );

  const handleGenerateReport = async () => {
    if (!dateRange.start || !dateRange.end) {
      alert('Please select both start and end dates');
      return;
    }
    await generateReportData();
  };

  return (
    <div className={`pt-20 pb-4 p-6 ${darkMode ? 'text-white' : 'text-black'}`}>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Generate Report</h2>
        
        <div className={`p-6 rounded-md shadow ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className={`p-2 rounded w-full max-w-xs ${
                  darkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-black border-gray-300'
                }`}
              >
                <option value="rent">Rent Collection</option>
                <option value="maintenance">Maintenance</option>
                <option value="occupancy">Occupancy</option>
              </select>
            </div>

            <div className="flex gap-4">
              <div>
                <label className="block mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className={`p-2 rounded ${
                    darkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-black border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className={`p-2 rounded ${
                    darkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-black border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleGenerateReport}
                className={`px-4 py-2 rounded text-white ${
                  darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-900 hover:bg-blue-800'
                }`}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>

              {reportData && (
                <PDFDownloadLink
                  document={<ReportDocument />}
                  fileName={`${reportType}_report_${dateRange.start}_${dateRange.end}.pdf`}
                  className={`px-4 py-2 rounded text-white ${
                    darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-700 hover:bg-green-600'
                  }`}
                >
                  {({ loading }) => (loading ? 'Preparing PDF...' : 'Download PDF')}
                </PDFDownloadLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
