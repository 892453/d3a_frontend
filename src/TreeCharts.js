import React, {useEffect, useState} from "react";
import {DecompositionTreeGraph} from "@ant-design/graphs";
import {getRootApi, getChildrenApi} from "./asset/api";
import {List, message} from "antd";
import "./tooltip.css";


const TreeCharts = () => {

    // state，数据状态，可以理解为一个数据仓库，键为data, setData为为其赋值的方法，赋值是异步
    const [data, setData] = useState({})

    // 可监听[]中填写的数据的变化，即会执行其中的内容
    // 此处监听到页面加载，会执行getRootApi方法，将初始数据存放到data中
    useEffect(() => {
        getRootApi().then(res => {
            const data = res.data;
            setData(data)
        })
        

    }, [])

    // 定义一个异步请求
    const fetchData = (node) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // getChildrenApi(node.addr, node.isAction).then(res => {
                //     const {data} = res
                //     if (data === undefined || data.length === 0) {
                //         message.info('节点没有数据').then()
                //     }
                //     resolve(data)
                // }).catch(error => {
                //     message.error(error.message).then()
                //     resolve([])
                // })
                getChildrenApi().then(res => {
                    // console.log(res);
                    resolve(res.data.data);
                })

            }, 100);
        });
    };

    // // 定义getChildren方法，作为nodeConfig中的回调方法，再点击图形中的展开图标，会调用到此方法
    const getChildren = async (node) => {
        return await fetchData(node)
    };

    const config = {
        // 初始数据
        data: data,
        // 开启动画
        animate: true,
        // 是否缩放节点大小自适应容器，不要开启，否则会视角跳转
        autoFit: false,
        // 弹窗配置
        tooltipCfg: {
            trigger: 'click | mouseenter ',
            // 自定义弹窗内容，如果有弹窗内容则显示其内容，用Antd的List组件进行渲染
            customContent: (cfg) => {
                return (
                    <>
                        {
                            (cfg.tooltip === undefined || cfg.tooltip?.length === 0) ?
                                <div>
                                    <>无内容</>
                                </div>
                                : <List
                                    size="small"
                                    bordered
                                    dataSource={cfg.tooltip}
                                    renderItem={item => <List.Item>{item}</List.Item>}
                                />
                        }
                    </>
                )
            }
        },
        // 节点配置
        nodeCfg: {
            // 懒加载，回调方法
            getChildren,
            // 节点自动宽度，后面设置自定义宽度，需要关闭
            autoWidth: true,
            // size: [120, 10],
            title: {
                // 内容超出隐藏
                autoEllipsis: false,
                // title 容器样式，例如容器颜色填充
                containerStyle: (cfg) => {
                    if (cfg?.virtual === true) {
                        // 虚节点
                        return {
                            fill: '#c2d6d6',//浅绿色
                        }
                    } else if (cfg?.isAction !== true) {
                        // 主结构
                        return {
                            fill: '#809FFF'//深蓝色
                        }
                    }
                    // action
                    return {
                        fill: '#C2D6FF'//浅蓝色
                    }
                },
                // title样式，使用等宽字体否则会出现字母和数字宽度不一问题
                style: {
                    fontFamily: 'Courier'
                }
            }
        },
        // 小地图配置
        minimapCfg: {
            // 显示小地图
            show: true,
            // 小地图长、宽
            size: [300, 150],
            // 渲染类型：下面配置消耗资源最少
            type: 'delegate',
            // 间距
            padding: 20,
        },
        // 边样式，节点直接的连接线
        edgeCfg: {
            // 边样式
            style: (item, graph) => {
                const target = graph.findById(item.target).getModel();
                // 如果是真实节点，并且是action，线条
                if (target.virtual === false && target.isAction === true) {
                    // 配置边完全透明，箭头也会跟着透明，并且鼠标移动到上面也透明
                    return {
                        strokeOpacity: 0,
                    }
                }
                return {
                    // 线条宽度
                    lineWidth: 2,
                    strokeOpacity: 0.5,
                };
            },
        },
        // 展开图标
        markerCfg: (cfg) => {
            // 获得节点中的属性
            const {children} = cfg;
            const {nextHop} = cfg;
            const {isAction} = cfg;
            if (isAction === true && nextHop === false) {
                return {
                    show: false,
                    collapsed: !children?.length,
                }
            } else {
                return {
                    show: true,
                    collapsed: !children?.length,
                }
            }
        },
        // 布局
        layout: {
            getWidth: (cfg) => {
                let width = 80
                const tip_length = cfg?.tip?.length
                if (tip_length !== undefined && tip_length > 20) {
                    width += tip_length * 2;
                }
                // 用于计算布局的节点宽度
                return width;
            },
            // 调整布局节点高度
            getHeight: (cfg) => {
                if (cfg?.virtual === true) {
                    return 40
                }
                return -6
            },
            // getVGap: (cfg) => {
            //     if (cfg?.virtual === true) {
            //         return 18
            //     }
            //     return 16
            // },
            // 水平间距，基础间距+节点宽度，自动调整
            getHGap: (cfg) => {
                let length = 100
                const tip_length = cfg?.tip?.length
                if (tip_length !== undefined && tip_length > 20) {
                    length += tip_length * 2
                }
                return length;
            }
        },
        behaviors: ['drag-canvas', 'scroll-canvas', 'zoom-canvas', 'drag-node'],
    };


    return (
        <>
            <DecompositionTreeGraph className={'tree-charts'} {...config} />
        </>
    )
}

export default TreeCharts
