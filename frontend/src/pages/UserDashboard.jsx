import { LogOut, User, LibraryBig, BookOpen, Mail, Calendar, BookMarked, GraduationCap, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Book Table component
function BookTable({ data, columns, emptyMessage }) {
  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={`${item.id}-${column.key}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserDashboard() {
  const navigate = useNavigate();
  const {authUser, setAuthUser} = useAuthContext();
  const [profileOpen, setProfileOpen] = useState(true);
  const [viewBooksOpen, setViewBooksOpen] = useState(false);
  const [myBooksOpen, setMyBooksOpen] = useState(false);
  
  // Books data states
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search states
  const [librarySearchTerm, setLibrarySearchTerm] = useState('');
  const [myBooksSearchTerm, setMyBooksSearchTerm] = useState('');
  
  // Filtered data based on search
  const [filteredLibraryBooks, setFilteredLibraryBooks] = useState([]);
  const [filteredMyBooks, setFilteredMyBooks] = useState([]);
  
  // Fetch all books from the API
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/v1/api/books', {
        withCredentials: true
      });
      
      // Transform the data to match our component's expected format
      const transformedBooks = response.data.map(book => ({
        id: book._id,
        bookId: book.bookId,
        title: book.title,
        available: book.isAvailable,
        currentStock: book.currentStock,
        totalStock: book.totalStock
      }));
      
      setLibraryBooks(transformedBooks);
      setFilteredLibraryBooks(transformedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch user's checked out books
  const fetchMyBooks = async () => {
    setLoading(true);
    try {
      if (!authUser || !authUser._id) {
        toast.error('User information is missing');
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/v1/api/user/${authUser._id}`, {
        withCredentials: true
      });
      
      // Transform the transactions data to match our component's expected format
      const transformedTransactions = response.data.map(transaction => ({
        id: transaction._id,
        title: transaction.bookId.title,
        bookId: transaction.bookId.bookId,
        issueDate: new Date(transaction.issueDate).toISOString().split('T')[0],
        dueDate: new Date(transaction.dueDate).toISOString().split('T')[0],
        returnDate: transaction.returnDate ? new Date(transaction.returnDate).toISOString().split('T')[0] : null,
        status: transaction.status
      }));
      
      setMyBooks(transformedTransactions);
      setFilteredMyBooks(transformedTransactions);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // No transactions found for this user is not an error
        setMyBooks([]);
        setFilteredMyBooks([]);
      } else {
        console.error('Error fetching user books:', error);
        toast.error('Failed to load your books');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Load data when component mounts or tabs change
  useEffect(() => {
    if (viewBooksOpen) {
      fetchBooks();
    }
    if (myBooksOpen) {
      fetchMyBooks();
    }
  }, [viewBooksOpen, myBooksOpen, authUser]);
  
  // Filter library books based on search term
  useEffect(() => {
    if (librarySearchTerm) {
      const filtered = libraryBooks.filter(
        book => 
          book.title.toLowerCase().includes(librarySearchTerm.toLowerCase()) ||
          book.bookId.toLowerCase().includes(librarySearchTerm.toLowerCase())
      );
      setFilteredLibraryBooks(filtered);
    } else {
      setFilteredLibraryBooks(libraryBooks);
    }
  }, [librarySearchTerm, libraryBooks]);
  
  // Filter my books based on search term
  useEffect(() => {
    if (myBooksSearchTerm) {
      const filtered = myBooks.filter(
        book => 
          book.title.toLowerCase().includes(myBooksSearchTerm.toLowerCase()) ||
          book.bookId.toLowerCase().includes(myBooksSearchTerm.toLowerCase())
      );
      setFilteredMyBooks(filtered);
    } else {
      setFilteredMyBooks(myBooks);
    }
  }, [myBooksSearchTerm, myBooks]);
  
  // Library books table columns
  const libraryColumns = [
    { key: 'title', header: 'Title' },
    { key: 'bookId', header: 'Book ID' },
    { 
      key: 'stock', 
      header: 'Stock',
      render: (book) => (
        <span>
          {book.currentStock} / {book.totalStock}
        </span>
      )
    },
    { 
      key: 'available', 
      header: 'Status',
      render: (book) => (
        <span className={`px-2 py-1 rounded-full text-xs ${book.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {book.available ? 'Available' : 'Unavailable'}
        </span>
      )
    }
  ];
  
  // My books table columns
  const myBooksColumns = [
    { key: 'title', header: 'Title' },
    { key: 'bookId', header: 'Book ID' },
    { key: 'issueDate', header: 'Issue Date' },
    { 
      key: 'status', 
      header: 'Status',
      render: (book) => {
        if (book.status === 'returned') {
          return (
            <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              Returned on {book.returnDate}
            </span>
          );
        }
        
        const today = new Date();
        const dueDate = new Date(book.dueDate);
        const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        let statusClass = 'bg-green-100 text-green-800';
        let statusText = `${daysLeft} days left`;
        
        if (daysLeft <= 0) {
          statusClass = 'bg-red-100 text-red-800';
          statusText = 'Overdue';
        } else if (daysLeft <= 3) {
          statusClass = 'bg-yellow-100 text-yellow-800';
          statusText = `${daysLeft} days left`;
        }
        
        return (
          <div>
            <div>Due: {book.dueDate}</div>
            <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
              {statusText}
            </span>
          </div>
        );
      }
    }
  ];
  
  const handleProfileClick = () => {
    setProfileOpen(true);
    setViewBooksOpen(false);
    setMyBooksOpen(false);
  }
  
  const handleViewBooksClick = () => {
    setViewBooksOpen(true);
    setProfileOpen(false);
    setMyBooksOpen(false);
  }
  
  const handleMyBooksClick = () => {
    setMyBooksOpen(true);
    setProfileOpen(false);
    setViewBooksOpen(false);
  }
  
  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/v1/api/auth/logout', {
        withCredentials: true,
      });
      setAuthUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      toast.success('Logged out successfully');
      navigate('/');
    }
    catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 h-full bg-white shadow-lg">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            <h1 className="text-xl font-bold text-center text-gray-800">{authUser.name}</h1>
          </div>
          
          <ul className="mt-6 flex-grow px-4 space-y-1">
            <li>
              <button 
                onClick={handleProfileClick}
                className={`w-full text-left py-3 px-4 rounded-lg flex gap-3 items-center transition-colors ${profileOpen ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <User size={18} />Profile
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left py-3 px-4 rounded-lg flex gap-3 items-center transition-colors ${viewBooksOpen ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={handleViewBooksClick}
              >
                <LibraryBig size={18}/> View Books
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left py-3 px-4 rounded-lg flex gap-3 items-center transition-colors ${myBooksOpen ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={handleMyBooksClick}
              >
                <BookOpen size={18} />My Books
              </button>
            </li>
          </ul>
          
          <div className="p-4 mt-auto border-t border-gray-200">
            <button className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-medium" onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {profileOpen && (
          <div className="p-8">
            <div className="flex items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Profile Content */}
              <div className="p-8">
                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info Card */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-blue-100 p-2 rounded-md">
                          <User size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium text-gray-800">{authUser.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-blue-100 p-2 rounded-md">
                          <Mail size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email Address</p>
                          <p className="font-medium text-gray-800">{authUser.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-blue-100 p-2 rounded-md">
                          <Calendar size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Admission Number</p>
                          <p className="font-medium text-gray-800">{authUser.admno}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Academic Info Card */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Academic Information</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-blue-100 p-2 rounded-md">
                          <GraduationCap size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Branch</p>
                          <p className="font-medium text-gray-800">{authUser.branch}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-blue-100 p-2 rounded-md">
                          <BookMarked size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Current Semester</p>
                          <p className="font-medium text-gray-800">{authUser.semester}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {viewBooksOpen && (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Library Books</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              {/* Search bar */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search by title or book ID..."
                    value={librarySearchTerm}
                    onChange={(e) => setLibrarySearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Loading state */}
              {loading && <div className="text-center py-8">Loading books...</div>}
              
              {/* Books table - showing all filtered books without pagination */}
              {!loading && (
                <BookTable
                  data={filteredLibraryBooks}
                  columns={libraryColumns}
                  emptyMessage="No books found matching your search criteria."
                />
              )}
            </div>
          </div>
        )}
        
        {myBooksOpen && (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Checked Out Books</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              {/* Search bar */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search by title or book ID..."
                    value={myBooksSearchTerm}
                    onChange={(e) => setMyBooksSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Loading state */}
              {loading && <div className="text-center py-8">Loading your books...</div>}
              
              {/* Books table - showing all filtered books without pagination */}
              {!loading && (
                <BookTable
                  data={filteredMyBooks}
                  columns={myBooksColumns}
                  emptyMessage="You don't have any books checked out at the moment."
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;