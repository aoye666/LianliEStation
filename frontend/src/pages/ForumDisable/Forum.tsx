import React from "react";
import {Button} from "antd";
import "./Forum.scss";
import Navbar from "../../components/Navbar/Navbar";
import Tabbar from "../../components/Tabbar/Tabbar";

const Forum=()=>{
    return (
        <div className="forum-container">
            <div className="navbar">
                <Navbar title="校园墙"/>
            </div>

            <div className="content">
                
                <div className="posts">

                </div>

                <div className="upload">
                    <Button type="primary" shape="circle" className="upload-btn">
                        上传
                    </Button>
                </div>

            </div>

            <div className="tabbar">
                <Tabbar initialIndex={1} />
            </div>
        </div>
    )
}

export default Forum