const getParticipantsFromNews = require("./participants");
console.log(
  getParticipantsFromNews(
    '<a href = "http://www.torn.com/profiles.php?XID=2477918" class="h">KSBdup</a> and <a href = "http://www.torn.com/profiles.php?XID=2508376" class="h">Rafata</a> have been selected by <a href = "http://www.torn.com/profiles.php?XID=2464998" class="h">swolf_za</a> to blackmail someone in 24 hours.'
  )
);
