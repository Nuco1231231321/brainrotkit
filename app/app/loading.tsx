export default function AppLoading() {
  return (
    <div className="app-page" aria-busy="true" role="status">
      <div className="app-loading-heading" />
      <div className="app-loading-grid" aria-label="Loading projects"><span /><span /><span /><span /></div>
      <p className="sr-only">Loading projects</p>
    </div>
  );
}
