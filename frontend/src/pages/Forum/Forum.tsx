import React from "react";
import {Button,Col,Row,Card,Image,Tabs,TabsProps,FloatButton} from "antd";
import "./Forum.scss";
import { useRecordStore } from "../../store";
import { useMainStore } from "../../store";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Tabbar from "../../components/Tabbar/Tabbar";
import takePlace from "../../assets/takePlace.png";
import publish from "../../assets/publish-white.svg";
import { PlusOutlined } from "@ant-design/icons";


const {Meta} = Card;


const Forum=()=>{
    const navigate = useNavigate();
    const recordStore = useRecordStore();
    const mainStore = useMainStore();
    const {forums} = mainStore;
    const nav: TabsProps['items'] =[
        {
            key: '1',
            label: '时间',
        },
        {
            key: '2',
            label: '热度',
        },
        {
            key: '3',
            label: '精选',
        }

    ]
                   
    return (
        <div className="forum-container">
            <div className="navbar">
                <Navbar title="校园墙"/>
            </div>

            <div className="content">
                <div className="banner">
                    <Tabs className="Tabs" centered items={nav} defaultActiveKey="1" />
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
                    <Row className="Row" onClick={()=>navigate(`/forum-detail`)}>
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
                    <Row className="Row" onClick={()=>navigate(`/forum-detail`)}>
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
                    forums.map((post,index)=>(
                        <Row key={index} className="Row" onClick={()=>navigate(`/forum-detail`)}>
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
                <div className="float-button">
                    <FloatButton icon={<PlusOutlined />} onClick={()=>{
                        navigate("/publish/forum-publish")
                        }}/>
                </div>
                <Tabbar initialIndex={1} />
            </div>
        </div>
    )
}

export default Forum