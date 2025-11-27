import React, { useState, useEffect } from 'react';
import { useFiles } from '../contexts/FileContext';
import { useDebounce } from '../hooks/useDebounce';
import FileCard from '../components/FileCard';
import { Input } from '@/components/ui/input'; // shadcn/ui Input
import { Card, CardContent } from '@/components/ui/card'; // shadcn/ui Card
import { Skeleton } from '@/components/ui/skeleton'; // shadcn/ui Skeleton
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'; // shadcn/ui Pagination components

// This component renders the skeleton placeholders
const FileCardSkeleton = () => (
  <Card className="h-full flex flex-col">
    <Skeleton className="h-[140px] w-full rounded-b-none" />
    <CardContent className="flex-grow p-4 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
    <div className="p-4 pt-0">
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
  </Card>
);

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { files, loading, currentPage, totalPages, fetchFiles } = useFiles();
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchFiles(currentPage, debouncedSearchTerm); // Fetch current page on initial load and search term change
  }, [debouncedSearchTerm, fetchFiles, currentPage]); // Added currentPage as dependency

  const handlePageChange = (pageNumber: number) => {
    fetchFiles(pageNumber, debouncedSearchTerm);
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-center">STL Shelf</h1>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search for files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Render 9 skeleton cards to match the page limit
          Array.from(new Array(9)).map((_, index) => (
            <div key={index}>
              <FileCardSkeleton />
            </div>
          ))
        ) : (
          files.map(file => (
            <div key={file.id}>
              <FileCard file={file} />
            </div>
          ))
        )}
      </div>
      
      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                </PaginationItem>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink 
                    isActive={page === currentPage} 
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
};

export default HomePage;
