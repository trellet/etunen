import './App.scss';

import React from 'react';
import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { SWRConfig } from 'swr';
import { fetcher } from './components/_api';
import Container from 'react-bootstrap/Container';
import { UserProvider } from './components/UserProvider';
import Spinner from './components/Spinner';
import Header from './components/Header';
import ApiError from './components/ApiError';

import Authenticate from './components/Auth';
const VerifyEmail = lazy(() => import('./components/VerifyEmail'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
const Season = lazy(() => import('./components/Season'));
const SeasonRegs = lazy(() => import('./components/SeasonRegs'));
const SeasonPoints = lazy(() => import('./components/SeasonPoints'));
const BoardRoute = lazy(() => import('./components/Board'));
const Thread = lazy(() => import('./components/Thread'));
const Home = lazy(() => import('./components/Home'));
const Profile = lazy(() => import('./components/Profile'));
const Event = lazy(() => import('./components/Event'));
const EventAdmin = lazy(() => import('./components/EventAdmin'));
const DriverNumbers = lazy(() => import('./components/DriverNumbers'));

const ErrorFallback = ({ error }) => <ApiError error={error} />;

function Layout() {
  return (
    <div>
      <Header />
      <Container>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </Container>
      <footer id="footer"></footer>
    </div>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="board" element={<BoardRoute />} />
          <Route path="board/thread/:threadId" element={<Thread />} />
          <Route path="board/:forumId" element={<BoardRoute />} />
          <Route path="kirjaudu/ok" element={<p>Olet kirjautunut onnistuneesti sisään.</p>} />
          <Route path="kirjaudu" element={<Authenticate />} />
          <Route path="tulospalvelu/kausi/:seasonId/pisteet" element={<SeasonPoints />} />
          <Route path="tulospalvelu/kausi/:seasonId/ilmo" element={<SeasonRegs />} />
          <Route path="tulospalvelu/kausi/:seasonId" element={<Season />} />
          <Route path="tulospalvelu/kisa/:eventId/admin" element={<EventAdmin />} />
          <Route path="tulospalvelu/kisa/:eventId" element={<Event />} />
          <Route path="tulospalvelu/numerot" element={<DriverNumbers />} />
          <Route path="verify" element={<VerifyEmail />} />
          <Route path="reset" element={<ResetPassword />} />
          <Route path="trelle" element={<Profile />} />
          <Route path="spinner" element={<Spinner />} />
          <Route path="*" element={<h2>404</h2>} />
        </Route>
      </Routes>
    </BrowserRouter >
  );
}

function App() {
  return (
    <SWRConfig value={{ fetcher: fetcher, revalidateOnFocus: false, revalidateOnReconnect: false }}>
      <UserProvider>
        <AppRouter />
      </UserProvider>
    </SWRConfig>
  );
}

export default App;
