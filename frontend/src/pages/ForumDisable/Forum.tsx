import React from "react";
import {Button,Col,Row,Card,Image} from "antd";
import "./Forum.scss";
import { useRecordStore } from "../../store";
import Navbar from "../../components/Navbar/Navbar";
import Tabbar from "../../components/Tabbar/Tabbar";
import takePlace from "../../assets/takePlace.png";

const {Meta} = Card;


const Forum=()=>{
    const recordStore = useRecordStore();
    const {forumPosts} = recordStore;
                   
    return (
        <div className="forum-container">
            <div className="navbar">
                <Navbar title="校园墙"/>
            </div>

            <div className="content">
                <div className="advertise">

                </div>

                <div className="top-posts">
                    <Row className="Row">
                        <Col className="Col" span={24}>
                            <Card className="Card">示例</Card>
                        </Col>
                    </Row>
                    <Row className="Row">
                        <Col className="Col" span={24}>
                            <Card className="Card">示例</Card>
                        </Col>
                    </Row>
                    <Row className="Row">
                        <Col className="Col" span={24}>
                            <Card className="Card">示例</Card>
                        </Col>
                    </Row>
                </div>

                <div className="posts">
                    <Row className="Row">
                        <Col className="Col" span={24}>
                            <Card className="Card" title="校园墙">
                                11111
                                <Row>
                                    <Col span={8}>
                                        <Image src={takePlace} alt="takePlace" />
                                    </Col>
                                    <Col span={8}>
                                        <Image src={takePlace} alt="takePlace" />
                                    </Col>
                                    <Col span={8}>
                                        <Image src={takePlace} alt="takePlace" />
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="Row">
                        <Col className="Col" span={24}>
                            <Card className="Card" title="校园墙" >
                                示例内容
                                <Row>
                                    <Col span={8}>
                                        
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </div>
                {
                    forumPosts.map((post,index)=>(
                        <Row key={index} className="Row">
                            <Col className="Col" span={24}>
                                <Card className="Card" title={post.title}>
                                    {post.content}
                                    {post.images.length>0?(post.images.map(image=>(<Image src={image} alt={image} />))) : null}
                                </Card>
                            </Col>
                        </Row>
                    ))  
                }

            </div>

            <div className="tabbar">
                <Tabbar initialIndex={1} />
            </div>
        </div>
    )
}

export default Forum