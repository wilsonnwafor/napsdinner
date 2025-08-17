import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AdminSidebar from "@/components/admin/sidebar";
import KPICard from "@/components/admin/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Download, 
  Eye, 
  Mail, 
  X, 
  DollarSign, 
  ShoppingBag, 
  Ticket, 
  Vote,
  TrendingUp,
  Clock
} from "lucide-react";

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  remainingTickets: number;
  salesByCategory: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  items: Array<{
    category: string;
    quantity: number;
    ticketCodes: number[];
  }>;
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<DashboardData>({
    queryKey: ['/api/admin/dashboard'],
    meta: {
      headers: authService.setAuthHeader(),
    },
  });

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery<OrdersResponse>({
    queryKey: ['/api/admin/orders', { page: currentPage }],
    meta: {
      headers: authService.setAuthHeader(),
    },
  });

  const handleLogout = () => {
    authService.logout();
    setLocation("/admin/login");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      regular: "bg-blue-100 text-blue-800",
      couples: "bg-pink-100 text-pink-800",
      vip: "bg-gold-100 text-gold-800",
      sponsors: "bg-purple-100 text-purple-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (!authService.isAuthenticated()) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar onLogout={handleLogout} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6" data-testid="dashboard-header">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-navy-900">Dashboard Overview</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>Last updated: <span data-testid="last-updated">2 minutes ago</span></span>
              </div>
              <Button className="bg-gold-500 text-navy-900 px-4 py-2 rounded-lg font-semibold hover-lift">
                <Download className="mr-2" size={16} />
                Export Data
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* KPI Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="kpi-cards">
            {isDashboardLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))
            ) : (
              <>
                <KPICard
                  title="Total Revenue"
                  value={formatCurrency(dashboardData?.totalRevenue || 0)}
                  change="+12%"
                  icon={DollarSign}
                  color="green"
                />
                <KPICard
                  title="Total Orders"
                  value={dashboardData?.totalOrders.toString() || "0"}
                  change="+8%"
                  icon={ShoppingBag}
                  color="blue"
                />
                <KPICard
                  title="Tickets Remaining"
                  value={dashboardData?.remainingTickets.toString() || "0"}
                  subtitle="Out of 500 total"
                  icon={Ticket}
                  color="yellow"
                />
                <KPICard
                  title="Total Votes"
                  value="1,234"
                  change="+23%"
                  icon={Vote}
                  color="purple"
                />
              </>
            )}
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Sales by Category */}
            <Card className="luxury-shadow" data-testid="sales-chart">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-navy-900">Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {isDashboardLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData?.salesByCategory.map((item) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded mr-3 ${getCategoryColor(item.category).split(' ')[0]}`}></div>
                          <span className="capitalize">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{item.count} tickets</div>
                          <div className="text-sm text-gray-500">{formatCurrency(item.revenue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="luxury-shadow" data-testid="recent-activity">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-navy-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-800">Payment Verified</p>
                      <p className="text-sm text-green-600">Order #ORD-2024-001 - ₦50,000</p>
                      <p className="text-xs text-green-500">2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-800">New Artist Registration</p>
                      <p className="text-sm text-blue-600">Sarah Johnson - Music Performance</p>
                      <p className="text-xs text-blue-500">15 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-purple-800">New Vote Cast</p>
                      <p className="text-sm text-purple-600">Outstanding Academic Performance</p>
                      <p className="text-xs text-purple-500">32 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders Table */}
          <Card className="luxury-shadow overflow-hidden" data-testid="orders-table">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold text-navy-900">Recent Orders</CardTitle>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Search orders..." 
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    data-testid="search-orders"
                  />
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent">
                    <option>All Categories</option>
                    <option>Regular</option>
                    <option>Couples</option>
                    <option>VIP</option>
                    <option>Sponsors</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            
            <div className="overflow-x-auto">
              {isOrdersLoading ? (
                <div className="p-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full mb-4" />
                  ))}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ordersData?.orders.map((order) => (
                      <tr key={order.id} data-testid={`order-row-${order.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <span className="font-mono">#{order.id.slice(-8)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <Badge 
                                key={idx}
                                className={`text-xs ${getCategoryColor(item.category)}`}
                              >
                                {item.category} × {item.quantity}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(parseFloat(order.totalAmount))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-gold-600 hover:text-gold-800"
                              data-testid={`button-view-${order.id}`}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-blue-600 hover:text-blue-800"
                              data-testid={`button-email-${order.id}`}
                            >
                              <Mail size={14} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 hover:text-red-800"
                              data-testid={`button-cancel-${order.id}`}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {ordersData && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((ordersData.pagination.page - 1) * ordersData.pagination.limit) + 1} to{' '}
                    {Math.min(ordersData.pagination.page * ordersData.pagination.limit, ordersData.pagination.totalCount)} of{' '}
                    {ordersData.pagination.totalCount} results
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gold-500 text-navy-900"
                    >
                      {currentPage}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(ordersData.pagination.totalPages, currentPage + 1))}
                      disabled={currentPage === ordersData.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
