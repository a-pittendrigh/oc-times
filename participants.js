const getParticipantsFromNews = news => {
  let moreParticipants = true;
  let i = 0;
  let passes = 10;
  let withoutPlanner = news.substr(0, news.indexOf("have been selected by"));
  let participants = [];
  while (moreParticipants & (i++ < passes)) {
    //console.log(withoutPlanner);
    const anchorEnd = withoutPlanner.indexOf("</a>");
    let participant = withoutPlanner.substr(0, anchorEnd);
    const openingAnchorTagEnd = participant.indexOf(">");
    participant = participant.substr(
      openingAnchorTagEnd + 1,
      participant.length - 1
    );
    withoutPlanner = withoutPlanner.substr(
      anchorEnd + 4,
      withoutPlanner.length - 1
    );
    //console.log(participant);
    participants.push(participant);
    moreParticipants = withoutPlanner.indexOf("</a>") > -1;
  }
  return participants;
};

// console.log(
//   getParticipantsFromnews(
//     '<a href = "http://www.torn.com/profiles.php?XID=2477918" class="h">KSBdup</a> and <a href = "http://www.torn.com/profiles.php?XID=2508376" class="h">Rafata</a> have been selected by <a href = "http://www.torn.com/profiles.php?XID=2464998" class="h">swolf_za</a> to blackmail someone in 24 hours.'
//   )
// );

module.exports = getParticipantsFromNews;
