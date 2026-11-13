import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import NotificationCard from '../../components/cards/NotificationCard';
import { getNotifications, markNotificationRead } from '../../services/notificationService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [markingId, setMarkingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    getNotifications()
      .then((response) => {
        if (!active) return;
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Unable to load notifications.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleMarkRead = async (notificationId) => {
    setMarkingId(notificationId);
    setError('');
    setSuccess('');
    try {
      const response = await markNotificationRead(notificationId);
      setNotifications((current) => current.map((notification) => (
        notification._id === notificationId ? response.data.notification : notification
      )));
      setUnreadCount(response.data.unreadCount);
      setSuccess(response.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to mark the notification as read.');
    } finally {
      setMarkingId('');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Updates</span>
          <h1>Notifications</h1>
          <p className="muted">{unreadCount} unread</p>
        </div>
      </div>
      <div className="panel-card padded">
        {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
        {success ? <p className="auth-feedback auth-feedback--success" role="status">{success}</p> : null}
        {isLoading ? <Loader text="Loading notifications..." /> : notifications.length ? (
          <div className="stack-list">
            {notifications.map((item) => (
              <NotificationCard
                key={item._id}
                item={item}
                isMarking={markingId === item._id}
                onMarkAsRead={handleMarkRead}
              />
            ))}
          </div>
        ) : <EmptyState title="No notifications yet" description="Updates about your interviews will appear here." />}
      </div>
    </div>
  );
};

export default Notifications;
