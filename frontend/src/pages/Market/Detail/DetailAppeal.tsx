import React from "react";
import { message } from "antd";
import "./DetailAppeal.scss";
import { useMainStore } from "../../../store";
import { useParams, useNavigate } from "react-router-dom";
import close from "../../../assets/close-black.svg";

const DetailAppeal = () => {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.goodsId;
  const title = params.goodsTitle;

  const { changeGoodsResponse, publishAppeal } = useMainStore();

  const handleDislike = async () => {
    if (title && id) {
    const res1 = await publishAppeal(title, Number(id), "", "goods", []);
    const res2 = await changeGoodsResponse(
      "dislike",
      id,
      1
    );
    if (res1 && res2 === "success") {
      message.success("已提交举报");
      navigate(`/market/${Number(id)}`);
    } else {
      message.error("举报失败");
    }}
  };

  return (
    <div className="appeal-container">
      <img className="appeal-cancel" src={close} alt="取消"></img>
      <textarea
        className="appeal-area"
        placeholder="请写下您的反馈..."
      ></textarea>
      <div className="appeal-control">
        <input className="appeal-img" type="file" id="file" />
        <button className="appeal-submit" onClick={handleDislike}>
          提交举报
        </button>
      </div>
    </div>
  );
};

export default DetailAppeal;
