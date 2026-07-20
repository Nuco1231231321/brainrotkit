export default function Loading() {
  return (
    <div className="route-loading" aria-busy="true" aria-label="Loading page" role="status">
      <div className="loading-line" />
      <div className="loading-grid"><span /><span /><span /></div>
      <p>Loading page</p>
    </div>
  );
}
