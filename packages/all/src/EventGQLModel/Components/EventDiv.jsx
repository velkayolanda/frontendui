const formatTime = iso => new Date(iso).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });

const calculateMarginLeft = (start) => {
  const hour = new Date(start).getHours();
  const minute = new Date(start).getMinutes();
  return ((hour - 7) * 60 + minute) / (8 * 60) * 100;
};

const calculateWidth = (start, end) => {
  const duration = (new Date(end) - new Date(start)) / (1000 * 60); // in minutes
  return (duration / (8 * 60)) * 100;
};


const EventsCard = ({ event }) => {
  const { id, start, end, type, subject, topic, room, teacher, group, color } = event;

  const marginLeft = calculateMarginLeft(start); // % from timeline start
  const width = calculateWidth(start, end); // %

  const colorStyle = {
    backgroundColor: `${color}, 0.3`,
    borderColor: `${color}, 0.5`,
  };

  return (
    <div
      id={id}
      className="card mt-3"
      style={{ marginLeft: `${marginLeft}%`, width: `${width}%`, ...colorStyle }}
    >
      <div className="card-header text-center fw-bold" style={{ backgroundColor: `${color}, 0.5` }}>
        <small>{formatTime(start)} - {formatTime(end)}&nbsp;<abbr title={type} className="initialism">{type}</abbr></small>
      </div>
      <div className="card-body uo-card-body-collapsible-event">
        <h5 className="card-title"><a href="#">{subject}</a></h5>
        <h6 className="card-subtitle text-muted">{topic}</h6>
        <div className="card-text">
          <div className="pb-1 p-1">{room}</div>
          <div className="pb-1 p-1">{teacher}</div>
          <div className="pb-1 p-1">{group}</div>
        </div>
      </div>
    </div>
  );
};


const EventsDayRow = ({ date, events }) => {
  const dayLabel = new Date(date).toLocaleDateString('cs-CZ', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="row" id={date}>
      <div className="col-1 me-0 border bg-white">
        <strong>{dayLabel.split(',')[0]}</strong><br />
        <strong>{dayLabel.split(',')[1]}</strong>
      </div>
      <div className="col-11 ms-0 ps-0 border bg-white">
        <div>
          <div className="flexbox">
            {events.map(event => (
              <EventsCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const EventsHeader = () => {
  const hours = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00'];
  const width = `${100.0 / hours.length}%`
  return (
    <div className="row">
      <div className="col-1 me-0">&nbsp;</div>
      <div className="col-11 ms-0 ps-0 border">
        <div className="flexbox">
          {hours.map((hour, idx) => (
            <div className="flexbox rozvrhHodiny" style={{ width: width }} key={idx}>{hour}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const EventsGrid = ({ eventsByDate }) => (
  <div className="container-fluid">
    <EventsHeader />
    {Object.entries(eventsByDate).map(([date, events]) => (
      <EventsDayRow key={date} date={date} events={events} />
    ))}
  </div>
);
