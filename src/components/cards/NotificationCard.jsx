const NotificationCard = ({ item, onMarkAsRead, isMarking }) => (
  <div className={`notification-card ${item.isRead ? '' : 'is-unread'}`}>
    <div className="notification-card__dot" />
    <div>
      <h4>{item.title}</h4>
      <p>{item.message}</p>
      <span>{new Date(item.createdAt).toLocaleString()}</span>
    </div>
    {!item.isRead ? (
      <button
        className="btn btn--secondary btn--sm notification-card__action"
        type="button"
        disabled={isMarking}
        onClick={() => onMarkAsRead(item._id)}
      >
        {isMarking ? 'Saving...' : 'Mark as read'}
      </button>
    ) : null}
  </div>
);

export default NotificationCard;
