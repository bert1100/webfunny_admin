import "./index.scss"
import React, { Component } from "react"
import { Input, Row, Icon, Timeline, BackTop, Card, Button, Spin, Popover, Select, Modal } from "antd"
import { loadPageTimeOption } from "ChartConfig/behaviorsChartConfig"
import Header from "Components/header"
import Utils from "Common/utils"
const echarts = require("echarts")
const Option = Select.Option
class Behaviors extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      searchExampleAble: false,
      loadPageTimeChart: null
    }
    this.changeInputValue = this.changeInputValue.bind(this)
    this.search = this.search.bind(this)
    this.showPreviewPage = this.showPreviewPage.bind(this)
    this.handleTimeScopeChange = this.handleTimeScopeChange.bind(this)
    this.createLoadPageTimeChart = this.createLoadPageTimeChart.bind(this)
  }

  componentDidMount() {
    $("#searchBox, .ant-spin-container, .behaviors-container").bind("keyup", (event) => {
      if (event.keyCode === 13) {
        this.search()
      }
    })
    // console.log(Utils.b64DecodeUnicode("MjQxMDJCNkYtRjlDNS00QTdFLUIyRUItRUNFOERDMEM2NTE4"))
  }

  componentWillUnMount() {
    this.props.clearBehaviorsState()
  }

  render() {
    const { behaviorList, searchFlag, userInfo, timeScope, showMore } = this.props
    const bLen = behaviorList.length
    let happenTimeTemp = ""
    const selectTimeScope =
      <Select defaultValue={timeScope + 1 + "天"} style={{ width: 80 }} onChange={this.handleTimeScopeChange}>
        <Option value={0}>1天</Option>
        <Option value={1}>2天</Option>
        <Option value={2}>3天</Option>
        <Option value={6}>7天</Option>
        <Option value={30}>30天</Option>
      </Select>

    return <div className="behaviors-container">
      <BackTop>
        <Icon type="to-top" size="L"/>
      </BackTop>
      <Header
        chooseProject={this.choseProject.bind(this)}
        loadedProjects={this.loadedProjects.bind(this)}
        parentProps={this.props}
      />
      <Spin spinning={this.state.loading}>
        <div className={searchFlag ? "behaviors-con behaviors-con-s" : "behaviors-con"}>
          <Input
            id="searchBox"
            size="large"
            addonBefore={selectTimeScope}
            addonAfter={<span className="search-btn" onClick={this.search}><Icon type="search"/> 搜索</span>}
            placeholder="搜索用户的行为记录，请输入KEY或者USERID"
            onChange={this.changeInputValue}
          />
          <Button disabled={this.state.searchExampleAble} className="sea-example" onClick={this.exampleSearch.bind(this)}><img src={require("Images/behaviors/click.png")} /> 搜索演示</Button>
        </div>
        { behaviorList.length > 0 &&
        <Row className="footprint-container">
          <Card id="behaviorsInfo" title={"行为记录列表"}>
            {!showMore && <Button style={{marginBottom: 20}} onClick={this.showMore.bind(this)}>展示更多</Button>}
            <Timeline>
              {
                behaviorList.map((behavior, index) => {
                  if (bLen > 200 && !showMore && index < bLen - 100) {
                    return null
                  }
                  if (behavior.happenTime === happenTimeTemp) {
                    return null
                  }
                  happenTimeTemp = behavior.happenTime
                  const happenTime = new Date(parseInt(behavior.happenTime, 10)).Format("yyyy-MM-dd hh:mm:ss.S")
                  let completeUrl = decodeURIComponent(behavior.completeUrl || behavior.simpleUrl)
                  let color = ""
                  let behaviorName = ""
                  let behaviorContent = ""
                  if (behavior.uploadType === "ELE_BEHAVIOR") {
                    color = "#333333"
                    behaviorName = "点击了 "
                    let innerText = Utils.b64DecodeUnicode(behavior.innerText)
                    let placeholder = ""
                    const placeholderArray = behavior.placeholder.split(" ")
                    placeholderArray.forEach((item) => {
                      placeholder += Utils.b64DecodeUnicode(item) + " "
                    })
                    const reg = /[\u4e00-\u9fa5]/
                    try {
                      innerText = reg.test(innerText) ? innerText : decodeURIComponent(innerText)
                    } catch (e) {
                      innerText = innerText
                    }
                    behaviorContent = <span><label>{behavior.tagName + "标签 （" + innerText + placeholder + "）"}</label><br/><i style={{fontSize: 12}}>{"样式名：" + Utils.b64DecodeUnicode(behavior.className)}</i></span>
                  } else if (behavior.uploadType === "CUSTOMER_PV") {
                    color = "blue"
                    behaviorName = "进入页面 "
                    behaviorContent = behavior.simpleUrl.replace(/https:\/\/.*\//g, "https://****/")
                  } else if (behavior.uploadType === "JS_ERROR") {
                    color = "red"
                    behaviorName = "发生错误 "
                    behaviorContent = Utils.b64DecodeUnicode(behavior.errorMessage)
                  } else if (behavior.uploadType === "SCREEN_SHOT") {
                    color = "darkgoldenrod"
                    behaviorName = "屏幕截图 "
                    behaviorContent = Utils.b64DecodeUnicode(behavior.screenInfo)
                    if (behaviorContent.indexOf("data:image/webp;base64") === -1 && behaviorContent.indexOf("data:image/png;base64") === -1 ) {
                      behaviorContent = "data:image/webp;base64," + behaviorContent
                    }
                  } else if (behavior.uploadType === "HTTP_LOG") {
                    const status = behavior.status
                    const loadTime = (behavior.loadTime / 1000).toFixed(2)
                    behaviorName = behavior.statusResult
                    color = "cyan"
                    if (behaviorName === "请求返回" && status === "200") {
                      color = "green"
                      behaviorName = <span style={{display: "block"}}>{behavior.statusResult} <i style={{fontSize: 12, color}}>{"    状态：" + status + "  "} <b>||</b> {"  " + "耗时：" + loadTime + "秒  " }</i></span>
                    } else if (behaviorName === "请求返回" && status !== "200") {
                      color = "red"
                      behaviorName = <span style={{display: "block"}}>{behavior.statusResult} <i style={{fontSize: 12, color}}>{"    状态：" + status + "  "} <b>||</b> {"  " + "耗时：" + loadTime + "秒  " }</i></span>
                    }
                    behaviorContent = <span style={{display: "block"}}><i style={{fontSize: 12}}>请求地址：{Utils.b64DecodeUnicode(behavior.httpUrl).replace(/https:\/\/.*\//g, "https://****/")}</i></span>
                  } else if (behavior.uploadType === "APP_BEHAVIOR") {
                    color = "#b7b752"
                    behaviorName = <span style={{display: "block"}}>{behavior.behaviorType} <i style={{fontSize: 12, color}}>{"    状态：" + behavior.behaviorResult + "  "}</i></span>
                    behaviorContent = behavior.description
                    completeUrl = ""
                  } else {
                    color = "black"
                  }
                  return <Timeline.Item color={color} key={index}>
                    <span>
                      <label className="footprint-des" onClick={this.showDetail.bind(this, behavior.uploadType, behaviorContent)}>
                        {behaviorName}
                        { behavior.uploadType === "SCREEN_SHOT" ?
                          <span>
                            <Popover placement="right" content={<img src={behaviorContent}/>} title="屏幕快照">
                              <a type="primary" style={{marginLeft: 10, marginRight: 10}}> 预览 </a>
                            </Popover>
                            <br/><i style={{fontSize: 12}}>截图描述：{Utils.b64DecodeUnicode(behavior.description)}</i>
                          </span>
                          :
                          behaviorContent
                        }
                      </label>
                      <label className="footprint-time"><b style={{color: "#666"}}>客户端时间：{happenTime}</b></label>
                      <label className="footprint-time"><a style={{color: "#77b3eb"}} href={completeUrl} target="_blank">{completeUrl.replace(/https:\/\/.*\//g, "https://****/")}</a></label>
                    </span>
                  </Timeline.Item>
                })
              }
            </Timeline>
          </Card>

        </Row>
        }
        {
          <Row className="userInfo-container">
            { userInfo &&
              <Card id="infoCard" title={"用户基本信息"}>
                <p>设备名称：{userInfo.deviceName} &nbsp;&nbsp;&nbsp;&nbsp; <a onClick={this.searchPhone.bind(this, "https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=" + userInfo.deviceName)}>机型搜索</a></p>
                <p>系统版本：{userInfo.os}</p>
                <p>网络地址：{userInfo.monitorIp}</p>
                <p>所在地区：{userInfo.province + "  " + userInfo.city}</p>
                <p>
                  <span style={{display: "block"}}>开始时间：{new Date(parseInt(userInfo.startTime, 10)).Format("yyyy-MM-dd hh:mm:ss")}</span>
                  <span>结束时间：{new Date(parseInt(userInfo.endTime, 10)).Format("yyyy-MM-dd hh:mm:ss")}</span> (停留{((userInfo.endTime - userInfo.startTime) / 60000).toFixed(1)}分钟)
                </p>
                <p>行为记录：{behaviorList.length} 条</p>
              </Card>
            }
            { userInfo &&
            <Card id="loadCard" title="页面平均加载时间（网络环境评估）">
              <div id="loadPageTimeChart" className="chart-box" />
            </Card>
            }
            { userInfo &&
              <Card id="pvsCard" title={"接口请求平均耗时"}>
                <p>待发布</p>
              </Card>
            }
          </Row>
        }
      </Spin>

    </div>
  }
  exampleSearch() {
    const { exampleSearchValue } = this.props
    this.setState({loading: true, searchExampleAble: true})
    const searchValue = Utils.b64EncodeUnicode(exampleSearchValue)
    this.props.searchUserBehaviorsAction({searchValue, webMonitorId: "mcl_webmonitor", timeScope: 100 }, (result) => {
      const res = result.behaviorList
      const len = res.length
      for (let i = 0; i < res.length - 1; i++) {
        for (let j = 0; j < res.length - 1 - i; j++) {
          if (res[j].happenTime > res[j + 1].happenTime) {
            const temp = res[j]
            res[j] = res[j + 1]
            res[j + 1] = temp
          }
        }
      }
      const userInfo = result.cusDetail
      userInfo.startTime = res[0].happenTime
      userInfo.endTime = res[len - 1].happenTime
      this.props.updateBehaviorsState({behaviorList: res, searchFlag: true, userInfo})
      setTimeout(() => {
        this.createLoadPageTimeChart(result.loadPageTimeList)
      }, 1000)
      this.setState({loading: false})
    }, () => {
      this.setState({loading: false})
    })
  }
  search() {
    const { webMonitorId, timeScope } = this.props
    const searchValue = Utils.b64EncodeUnicode(this.props.searchValue)
    if (!searchValue) {
      Modal.warning({
        title: "提示",
        content: "搜索内容为空！",
      })
      return
    }
    this.setState({loading: true})
    this.props.searchUserBehaviorsAction({searchValue, webMonitorId, timeScope }, (result) => {
      const res = result.behaviorList
      const len = res.length
      for (let i = 0; i < res.length - 1; i++) {
        for (let j = 0; j < res.length - 1 - i; j++) {
          if (res[j].happenTime > res[j + 1].happenTime) {
            const temp = res[j]
            res[j] = res[j + 1]
            res[j + 1] = temp
          }
        }
      }
      const userInfo = result.cusDetail
      userInfo.startTime = res[0].happenTime
      userInfo.endTime = res[len - 1].happenTime
      this.props.updateBehaviorsState({behaviorList: res, searchFlag: true, userInfo})
      setTimeout(() => {
        this.createLoadPageTimeChart(result.loadPageTimeList)
      }, 1000)
      this.setState({loading: false})
    }, () => {
      this.setState({loading: false})
    })
  }
  createLoadPageTimeChart(res) {
    const arr1 = []
    const arr2 = []
    res.forEach((page) => {
      arr1.push(page.simpleUrl.replace(/https:\/\/.*\//g, "/") + "（" + page.urlCount + "）")
      arr2.push(parseFloat((page.loadPage / 1000).toFixed(2)))
    })
    this.state.loadPageTimeChart = echarts.init(document.getElementById("loadPageTimeChart"))
    this.state.loadPageTimeChart.setOption(loadPageTimeOption(arr1, arr2))
  }
  handleTimeScopeChange(timeScope) {
    this.props.updateBehaviorsState({timeScope})
  }
  showMore() {
    const showMore = this.props.showMore
    this.props.updateBehaviorsState({showMore: !showMore})
  }
  changeInputValue(e) {
    const searchValue = e.target.value
    this.props.updateBehaviorsState({searchValue})
  }
  chooseTimeScope(timeScope) {
    this.props.updateBehaviorsState({timeScope})
  }
  choseProject(project) {
    const { webMonitorId } = project
    this.props.updateBehaviorsState({webMonitorId})
  }
  loadedProjects(project) {
    const { webMonitorId } = project
    this.props.updateBehaviorsState({webMonitorId})
  }
  showPreviewPage(url) {
    const previewUrl = url
    this.props.updateBehaviorsState({previewUrl})
  }
  showDetail(type, behaviorContent) {
    if (type === "JS_ERROR") {
      this.props.history.push("javascriptErrorDetail?errorMsg=" + behaviorContent)
    }
  }
  searchPhone(url) {
    window.open(url)
  }
}

Behaviors.propTypes = {
}

export default Behaviors
