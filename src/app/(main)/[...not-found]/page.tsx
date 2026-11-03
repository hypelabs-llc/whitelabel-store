import NotFound from "../not-found";

// Catch-all under the (main) group: any URL that matches no real page renders the 404 here, inside the
// app shell (sidebar + top bar). Real routes (/, /proxies, /orders, …) take precedence.
//
// It *renders* the not-found UI directly instead of calling the framework notFound(). notFound() throws
// at render, which trips the React DevTools profiler ("Failed to execute 'measure' on 'Performance'")
// in dev; rendering avoids the throw entirely. Trade-off: the HTTP status stays 200 instead of 404 —
// fine here, since these are authenticated app routes that aren't indexed.
export default function CatchAllNotFound() {
	return <NotFound />;
}
