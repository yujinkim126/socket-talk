var clipYn = "";
function goTicketType() {
  var rtchk = true;
  if (parent.data.selectedSeatCount <= 0) {
    alert("선택된 좌석이 없습니다.");
    rtchk = false;
  } else {
    var params = parent.$("#sForm").serializeArray();
    var chkSeatCount = 0;

    $.each(parent.seatData, function (key, val) {
      params.push({ name: "seatId", value: val.sid });
      params.push({ name: "clipSeatId", value: val.csid });
      chkSeatCount++;
    });
    params.push({ name: "chkcapt", value: Captcha.getData() });

    $.ajax({
      type: "POST",
      dataType: "jsonp",
      url: "/tktapi/reservation/prodlimit.json?v=1",
      async: false,
      data: params,
      success: function (result) {
        if (result.result == "0000") {
          var cnt = 0;
          $.each(parent.seatData, function (key, val) {
            parent
              .$("#sFormSub")
              .append(
                '<input type="hidden" id="seatIds' +
                  cnt +
                  '" name="seatIds" value="' +
                  val.sid +
                  '">'
              );
            cnt++;
          });

          var sf = parent.document.sForm;
          var sfs = parent.document.sFormSub;

          //encrpytedSeatIds, inter
          sfs.encryptedSeatIds.value = result.encryptedSeatIds;
          sfs.interlockTid.value = result.interlockTid;

          sfs.scheduleNo.value = sf.scheduleNo.value;
          sfs.flplanTypeCode.value = sf.flplanTypeCode.value;
          sfs.seatTypeCode.value = sf.seatTypeCode.value;
          sfs.target = "oneStopFrame";
          sfs.action = "/reservation/popup/stepTicket.htm";
          sfs.submit();

          for (var i = 0; i < cnt; i++) {
            parent.$("#seatIds" + i).remove();
          }
        } else {
          if (result.code != "T0002")
            // 인증예매(캡챠) 미완료시  alert 없이 팝업만 표출하기 위함
            alert(result.message);

          if (result.code == "T8270" || result.code == "T8280") {
            init_suv();
            parent.data.selectedSeatCount = 0;
            setSelectSeatCount(true);
            getBlockSeatList();
          } else if (result.code == "T9110") {
            parent.rsrvPopupClose();
          } else if (result.code == "T0002") {
            // T0002 : 인증 미완료시
            parent.captchaObj.show();
            Captcha.setData("");
          }
        }
      },
      error: function (e) {
        alert("다시 시도부탁드립니다.");
      },
    });
  }
}

var lastZone = null;
var lastGrade = null;

function confirmChangeBlock() {
  if (parent.data.selectedSeatCount == 0) {
    return true;
  } else {
    if (confirm("현재 선택한 좌석정보를 삭제하고 이동하시겠습니까?")) {
      $("#partSeatSelected").empty();
      return true;
    } else {
      return false;
    }
  }
}

function selectedBlock(
  blockObj,
  blockId,
  sntv,
  floorNo,
  floorName,
  areaNo,
  areaName,
  blockType
) {
  if (confirmChangeBlock()) {
    $(".view_seat").attr("style", "position: relative");
    var floor_no = floorNo == null ? "" : floorNo;
    var floor_name = floorName == null ? "" : floorName;
    var area_no = areaNo == null ? "" : areaNo;
    var area_name = areaName == null ? "" : areaName;

    $("li").removeClass("ck");
    $(blockObj).addClass("ck");

    parent.$("#blockId").val(blockId);
    parent.$("#sntv").val(sntv);
    parent.$("#floorNo").val(floor_no);
    parent.$("#floorName").val(floor_name);
    parent.$("#areaNo").val(area_no);
    parent.$("#areaName").val(area_name);
    parent.$("#blockTypeCode").val(blockType);
    parent.$("#mapClickYn").val("N");
    lastZone = sntv;
    getBlockSeatList();
  }
  myScroll.zoom(0);
  myScroll_minimap.zoom(0);
}

function bindDrawingInfo(fdata) {
  if (fdata != null) {
    $("#flplanInfo").val(fdata.flplanInfo);
  }
}

function viewLastGradeZone() {
  if (lastZone == null) {
    SelectGradeZone(parent.$("#stvn_view_list").val());
    fnSetidxSelectedSeatBlockList(parent.$("#stvn_view_list").val());
  } else {
    SelectGradeZone(lastZone);
    fnSetidxSelectedSeatBlockList(lastZone);
  }
}

function viewGradeZone(sntvList) {
  SelectGradeZone(sntvList);
  fnSetidxSelectedSeatBlockList(sntvList);
}

function bindSummaryList(list) {
  $("#divGradeSummary").empty();
  var seatGradeNo = parent.$("#seatGradeNo").val();
  var stvn_view_list = "";
  var sntvList = "";
  $.each(list, function (key, val) {
    parent.gradeData[val.seatGradeNo] = val.seatGradeName;
    stvn_view_list += ";" + val.sntvList;
    if (seatGradeNo == val.seatGradeNo) {
      sntvList = val.sntvList;
    }

    var appendObj = "";
    if (clipYn != "Y") {
      appendObj = $(
        '<tr id="gd' +
          val.seatGradeNo +
          '" onClick="goSummary(this, \'' +
          val.seatGradeNo +
          "','" +
          val.sntvList +
          "');\" onmouseover=\"viewGradeZone('" +
          val.sntvList +
          '\')"  onmouseout="viewLastGradeZone()" />'
      );
    } else {
      appendObj = $(
        '<tr id="gd' +
          val.seatGradeNo +
          '"  onmouseover="viewGradeZone(\'' +
          val.sntvList +
          '\')"  onmouseout="viewLastGradeZone()" />'
      );
    }
    appendObj
      .append(
        '<th class="seat_color"><em class="seat_color seat_vip" style="background-color:' +
          val.gradeColorVal +
          '"></em></th>'
      )
      .append('<td class="seat_name">' + val.seatGradeName + "</td>")
      .append('<td class="price">' + addComma(val.basePrice) + "원</td>")
      .append(
        parent.prodData.seatCntDisplayYn == "Y"
          ? '<td class="seat_remain">' + addComma(val.realSeatCntlk) + "석</td>"
          : '<td class="seat_remain"></td>'
      )
      .append('<td class="area_info">좌석보기</td>')
      .appendTo($("#divGradeSummary"));
    $("<tr>")
      .addClass("box_list_area")
      .append(
        '<td colspan="5"><div class="list_area"><ul><li>1</li></ul></div></td>'
      )
      .appendTo($("#divGradeSummary"));
  });

  if (parent.$("#stvn_view_list").val() != "") {
  } else {
    parent.$("#stvn_view_list").val(stvn_view_list.substring(1));
  }

  if (clipYn != "Y") {
    if (seatGradeNo != "") {
      goSummary(null, seatGradeNo, sntvList);
    }
  } else {
    $(".area_info").css("background", "url()");
    $("#txtSelectSeatInfo").html(
      '구역을 먼저 선택해주세요<span class="txt_seat_s">(화면을 내 구역을 직접 선택해주세요)</span>'
    );
  }
}

function bindBlockList(gradeObj, list, interlockTypeCode) {
  var ulobj = $(gradeObj).next().find("ul");
  ulobj.empty();
  $.each(list, function (key, val) {
    var liBlockId =
      "li" + $.escapeSelector(val.seatGradeNo + val.floorNo + val.areaNo);
    var realSeatCnt = 0;
    if ($("#" + liBlockId).length > 0) {
      realSeatCnt = $("#" + liBlockId)
        .find("span")
        .find("strong")
        .html();
      realSeatCnt = parseInt(realSeatCnt);
      realSeatCnt = realSeatCnt + val.realSeatCntlk;
      $("#" + liBlockId).remove();
    } else {
      realSeatCnt = val.realSeatCntlk;
    }

    var floorNo = val.floorNo == null ? "" : val.floorNo;
    var floorName = val.floorNo == null ? "" : val.floorName;
    var areaNo = val.areaNo == null ? "" : val.areaNo;
    var areaName = val.areaNo == null ? "" : val.areaName;

    var areaTit =
      floorNo.indexOf("EMPTY") > -1 || floorNo == ""
        ? ""
        : floorNo + " " + floorName;
    areaTit +=
      floorNo.indexOf("EMPTY") > -1 ||
      floorNo == "" ||
      val.areaNo.indexOf("EMPTY") > -1 ||
      areaNo == ""
        ? ""
        : " ";
    areaTit +=
      areaNo.indexOf("EMPTY") > -1 || areaNo == ""
        ? ""
        : areaNo + " " + areaName;

    var blockobj = $(
      "<li id='li" +
        val.seatGradeNo +
        val.floorNo +
        val.areaNo +
        "' onclick=\"selectedBlock(this,'" +
        ZONE_BLOCK_ID["'" + val.sntv + "'"] +
        "','" +
        val.sntv +
        "','" +
        floorNo +
        "','" +
        floorName +
        "','" +
        areaNo +
        "','" +
        areaName +
        "','" +
        val.blockTypeCode +
        "');\" onmouseover=\"viewGradeZone('" +
        val.sntv +
        '\')"  onmouseout="viewLastGradeZone()" />'
    ).append('<span class="area_tit" >' + areaTit + "</span>");
    if ("IL0002" != interlockTypeCode && "IL0003" != interlockTypeCode) {
      blockobj.append(
        '<span class="seat_residual"> <strong>' +
          addComma(realSeatCnt) +
          "</strong>석</span>"
      );
    }
    blockobj.appendTo(ulobj);
  });

  $(gradeObj).children().toggleClass("open");
  $(gradeObj).next().children().children().toggleClass("listOn");
}

function goSummary(gradeObj, gradeNo, sntvList) {
  if (
    gradeObj == null ||
    !$(gradeObj).next().children().children().hasClass("listOn")
  ) {
    parent.$("#seatGradeNo").val(gradeNo);
    SelectGradeZone(sntvList);
    fnSetidxSelectedSeatBlockList(sntvList);

    $.ajax({
      type: "POST",
      dataType: "jsonp",
      cache: true,
      url: "/tktapi/product/block/summary.json?v=1",
      async: false,
      data: {
        prodId: parent.$("#prodId").val(),
        pocCode: parent.$("#pocCode").val(),
        scheduleNo: parent.$("#scheduleNo").val(),
        seatGradeNo: parent.$("#seatGradeNo").val(),
        corpCodeNo: getCookie("corpCodeNo"),
      },
      jsonpCallback: "getBlockSummaryCallBack",
      success: function (result) {
        bindBlockList(gradeObj, result.summary, result.interlockTypeCode);
        lastGrade = gradeNo;
      },
      error: function (e) {},
    });
  } else {
    $(gradeObj).children().toggleClass("open");
    $(gradeObj).next().children().children().toggleClass("listOn");
  }
}

var formWrap = $("#sForm");
var blockId = formWrap.find("#blockId").val() || "";
var sntv = formWrap.find("#sntv").val() || "";
var floorNo = formWrap.find("#floorNo").val() || "";
var floorName = formWrap.find("#floorName").val() || "";
var areaNo = formWrap.find("#areaNo").val() || "";
var areaName = formWrap.find("#areaName").val() || "";
var blockType = formWrap.find("#blockTypeCode").val() || "SE0001";

function selectSeat(
  sid,
  pSeatGrade,
  pSeatTitle,
  selectCount,
  pSeatTypeCode,
  pClipSeatId,
  pSeatGradeNm
) {
  var objectid = "selectedSeat" + sid;
  if ($("#" + objectid).get() == null || $("#" + objectid).get() == "") {
    $('<li id="' + objectid + '">')
      .html(
        pSeatTitle + "<input type='hidden' name='seat_id' value='" + sid + "'/>"
      )
      .appendTo($("#partSeatSelected"));
    parent.seatData[sid] = new SeatInfo(
      sid,
      pSeatGrade,
      pSeatTitle,
      pSeatTypeCode,
      pClipSeatId,
      pSeatGradeNm
    );
    parent.$("#seatTypeCode").val(pSeatTypeCode);
  }
  parent.data.selectedSeatCount = selectCount;
  setSelectSeatCount(true);
}

SeatInfo = function (id, grade, tit, st, csid, gn) {
  this.sid = id;
  this.grade = grade;
  this.title = tit;
  this.seatType = st;
  this.csid = csid;
  this.gn = gn;
};

function selectSeat(
  sid,
  pSeatGrade,
  pSeatTitle,
  selectCount,
  pSeatTypeCode,
  pClipSeatId,
  pSeatGradeNm
) {
  var objectid = "selectedSeat" + sid;
  if ($("#" + objectid).get() == null || $("#" + objectid).get() == "") {
    $('<li id="' + objectid + '">')
      .html(
        pSeatTitle + "<input type='hidden' name='seat_id' value='" + sid + "'/>"
      )
      .appendTo($("#partSeatSelected"));
    parent.seatData[sid] = new SeatInfo(
      sid,
      pSeatGrade,
      pSeatTitle,
      pSeatTypeCode,
      pClipSeatId,
      pSeatGradeNm
    );
    parent.$("#seatTypeCode").val(pSeatTypeCode);
  }
  parent.data.selectedSeatCount = selectCount;
  setSelectSeatCount(true);
}

function selectedBlock(
  blockObj,
  blockId,
  sntv,
  floorNo,
  floorName,
  areaNo,
  areaName,
  blockType
) {
  $(".view_seat").attr("style", "position: relative");
  var floor_no = floorNo == null ? "" : floorNo;
  var floor_name = floorName == null ? "" : floorName;
  var area_no = areaNo == null ? "" : areaNo;
  var area_name = areaName == null ? "" : areaName;

  $("li").removeClass("ck");
  $(blockObj).addClass("ck");

  parent.$("#blockId").val(blockId);
  parent.$("#sntv").val(sntv);
  parent.$("#floorNo").val(floor_no);
  parent.$("#floorName").val(floor_name);
  parent.$("#areaNo").val(area_no);
  parent.$("#areaName").val(area_name);
  parent.$("#blockTypeCode").val(blockType);
  parent.$("#mapClickYn").val("N");

  // getBlockSeatList();
}
