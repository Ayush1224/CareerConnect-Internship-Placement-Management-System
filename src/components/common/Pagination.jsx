const Pagination = ({ currentPage, pageCount, onPageChange }) => {
  if (pageCount <= 1) return null;

  return (
    <div className="pagination">
      <button type="button" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
        Previous
      </button>
      <span>{currentPage} / {pageCount}</span>
      <button type="button" onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
