
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface SearchAndPaginationProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  eventsCount: number;
}

export const SearchAndPagination: React.FC<SearchAndPaginationProps> = ({
  searchTerm,
  onSearch,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  itemsPerPage,
  eventsCount
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="text-sm text-gray-600">
          Total: {totalCount} events
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => onPageChange(pageNumber)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing {Math.min(itemsPerPage, eventsCount)} of {totalCount} events 
        (Page {currentPage} of {totalPages})
      </div>
    </>
  );
};
