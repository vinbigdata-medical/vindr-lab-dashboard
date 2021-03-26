import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Spin, Table, Modal, Tooltip, Select, Row, Col } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { isEmpty } from '../../utils/helpers';
import { DRAW_TYPE, DRAW_SCOPE } from '../../utils/constants/config';
import {
  actionGetLabelGroups,
  actionGetLabels,
  actionDeleteLabelGroup,
  updateLabelOrder,
  actionUpdateLabelGroup,
} from './LabelsAction';
import { actionGetUsers } from '../../view/system/systemAction';
import NewLabelModal from './NewLabelModal';
import AddEditGroup from './AddEditGroup';
import EditLabelModal from './EditLabelModal';
import './Labels.scss';

const { Option } = Select;

const TYPE_MODAL = {
  NEW_LABEL: 1,
  ADD_EDIT_GROUP: 2,
  EDIT_LABEL: 3,
};

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  background: isDragging ? '#3f444f' : 'inherit',
  ...draggableStyle,
});

const DRAG_TYPE = {
  BOX: 'box',
  MASK: 'mask',
  POLYGON: 'polygon',
  STUDY: 'study',
  SERIES: 'series',
  IMAGE: 'image',
};
let isUpdatingLabelGroup = false;

const Labels = (props) => {
  const {
    projectId,
    labels,
    isFetchingLabels,
    selectedGroup,
    users = {},
    userInfo = {},
  } = props;

  const intl = useIntl();
  const { formatMessage: t } = intl;
  const [processing, setProcessing] = useState(false);
  const [typeModal, setTypeModal] = useState(null);
  const [findingData, setFindingData] = useState([]);
  const [impressionData, setImpressionData] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState({});
  const [updateFinding, setUpdateFinding] = useState(false);
  const [updateImpression, setUpdateImpression] = useState(false);
  const [selectedManagers, setSelectedManagers] = useState([]);

  useEffect(() => {
    props.actionGetUsers();
    return () => {
      isUpdatingLabelGroup = false;
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!isEmpty(selectedGroup)) {
      setSelectedManagers(selectedGroup.owner_ids || []);
      handleGetLabels();
    }
    // eslint-disable-next-line
  }, [selectedGroup]);

  useEffect(() => {
    if (labels?.data) {
      const { FINDING = [], IMPRESSION = [] } = labels?.data || {};
      if (FINDING.length > 0) {
        setFindingData([
          {
            id: 1,
            [DRAG_TYPE.BOX]: FINDING.filter(
              (it) => it?.annotation_type === DRAW_TYPE.BOUNDING_BOX
            ),
            [DRAG_TYPE.MASK]: FINDING.filter(
              (it) => it?.annotation_type === DRAW_TYPE.MASK
            ),
            [DRAG_TYPE.POLYGON]: FINDING.filter(
              (it) => it?.annotation_type === DRAW_TYPE.POLYGON
            ),
          },
        ]);
      } else {
        setFindingData([]);
      }
      if (IMPRESSION.length > 0) {
        setImpressionData([
          {
            id: 1,
            [DRAG_TYPE.STUDY]: IMPRESSION.filter(
              (it) => it?.scope === DRAW_SCOPE.STUDY
            ),
            [DRAG_TYPE.SERIES]: IMPRESSION.filter(
              (it) => it?.scope === DRAW_SCOPE.SERIES
            ),
            [DRAG_TYPE.IMAGE]: IMPRESSION.filter(
              (it) => it?.scope === DRAW_SCOPE.IMAGE
            ),
          },
        ]);
      } else {
        setImpressionData([]);
      }
    }
  }, [labels]);

  const handleGetLabels = () => {
    props.actionGetLabels({
      label_group_id: selectedGroup.id,
    });
  };

  const handleUpdateLabel = (lb) => {
    setSelectedLabel(lb);
    setTypeModal(TYPE_MODAL.EDIT_LABEL);
  };

  const labelItem = (item = {}, index) => (
    <div className="lb-item" key={item.id}>
      <span className="lb-wrap-item" onClick={() => handleUpdateLabel(item)}>
        <span className="lb-color" style={{ background: item.color }}></span>
        {item.name}
      </span>
      {item.sub_labels && (
        <Droppable droppableId={`droppable-${item.id}`} type={`${index}`}>
          {(provided, snapshot) => (
            <ul
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="sub-labels"
            >
              {(item.sub_labels || []).map((subLb, subIdx) => (
                <Draggable
                  key={`${index}${subIdx}`}
                  draggableId={`${index}${subIdx}`}
                  index={subIdx}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                      className="sub-label-item"
                      key={subLb.id}
                    >
                      <span
                        className="lb-wrap-item"
                        onClick={() =>
                          handleUpdateLabel({
                            ...subLb,
                            parent_name: item.name || '',
                          })
                        }
                      >
                        <span
                          className="lb-color"
                          style={{ background: subLb.color }}
                        ></span>
                        {subLb.name}
                      </span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided?.placeholder}
            </ul>
          )}
        </Droppable>
      )}
    </div>
  );

  const listItem = (list = [], type = '', isFinding) => {
    return (
      <DragDropContext
        onDragEnd={(result) => onDragEnd(result, type, isFinding)}
      >
        <Droppable droppableId="droppable" type="parent">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              placeholder={provided.placeholder}
              {...provided.droppableProps}
              className="lb-list"
            >
              {list.map((lb, idx) => {
                return (
                  <Draggable key={lb.id} draggableId={lb.id} index={idx}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                      >
                        {labelItem(lb, idx)}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided?.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = (result, type, isFinding) => {
    let currentData = isFinding ? findingData : impressionData;
    if (
      !result.destination ||
      result.destination?.index === result.source?.index ||
      currentData.length === 0
    ) {
      return;
    }
    if (result?.type === 'parent') {
      const items = reorder(
        currentData[0][type],
        result.source.index,
        result.destination.index
      );
      currentData[0][type] = items;
      if (isFinding) {
        setFindingData([...currentData]);
      } else {
        setImpressionData([...currentData]);
      }
    } else {
      let subItems = currentData[0][type][parseInt(result.type, 10)].sub_labels;
      const subTemp = reorder(
        subItems,
        result.source.index,
        result.destination.index
      );
      currentData[0][type][parseInt(result.type, 10)].sub_labels = subTemp;
      if (isFinding) {
        setFindingData([...currentData]);
      } else {
        setImpressionData([...currentData]);
      }
    }

    handleChangeOrder(currentData, isFinding);
  };

  const addOder = (arr = [], startOrder = 1) => {
    let order = startOrder;
    let newArr = [];
    arr.forEach((item) => {
      let subOder = order;
      newArr.push({ id: item.id, order: order++ });

      (item?.sub_labels || []).forEach((subItem) => {
        subOder += 0.1;
        let convertSubOrder = parseFloat(subOder.toFixed(1));
        newArr.push({ id: subItem.id, order: convertSubOrder });
      });
    });

    return newArr;
  };

  const handleChangeOrder = async (data = [], isFinding) => {
    if (data.length > 0) {
      let dataPut = {
        labels: [],
      };
      if (isFinding) {
        let finding = data[0] || {};
        let arrData = [
          ...finding[DRAG_TYPE.BOX],
          ...finding[DRAG_TYPE.MASK],
          ...finding[DRAG_TYPE.POLYGON],
        ];
        dataPut.labels = addOder(arrData);
      } else {
        let impression = data[0] || {};

        let arrData = [
          ...impression[DRAG_TYPE.STUDY],
          ...impression[DRAG_TYPE.SERIES],
          ...impression[DRAG_TYPE.IMAGE],
        ];
        dataPut.labels = addOder(arrData);
      }
      try {
        if (isFinding) {
          setUpdateFinding(true);
        } else {
          setUpdateImpression(true);
        }
        await updateLabelOrder(selectedGroup.id, dataPut);
      } catch (error) {
        console.log(error);
      } finally {
        if (isFinding) {
          setUpdateFinding(false);
        } else {
          setUpdateImpression(false);
        }
      }
    }
  };

  const impressionColumns = [
    {
      title: 'Study',
      key: 'studyData',
      dataIndex: 'studyData',
      width: '33.3%',
      render: (_, record) => listItem(record[DRAG_TYPE.STUDY], DRAG_TYPE.STUDY),
    },
    {
      title: 'Series',
      key: 'seriesData',
      width: '33.3%',
      dataIndex: 'seriesData',
      render: (_, record) =>
        listItem(record[DRAG_TYPE.SERIES], DRAG_TYPE.SERIES),
    },
    {
      title: 'Image',
      width: '33.3%',
      key: 'imageData',
      dataIndex: 'imageData',
      render: (_, record) => listItem(record[DRAG_TYPE.IMAGE], DRAG_TYPE.IMAGE),
    },
  ];

  const findingColumns = [
    {
      title: 'Box',
      key: 'boxData',
      dataIndex: 'boxData',
      width: '33.3%',
      render: (_, record) =>
        listItem(record[DRAG_TYPE.BOX], DRAG_TYPE.BOX, true),
    },
    {
      title: 'Mask',
      key: 'maskData',
      width: '33.3%',
      dataIndex: 'maskData',
      render: (_, record) =>
        listItem(record[DRAG_TYPE.MASK], DRAG_TYPE.MASK, true),
    },
    {
      title: 'Polygon',
      width: '33.3%',
      key: 'polygonData',
      dataIndex: 'polygonData',
      render: (_, record) =>
        listItem(record[DRAG_TYPE.POLYGON], DRAG_TYPE.POLYGON, true),
    },
  ];

  const handleDeleteLabelGroup = () => {
    if (processing || isEmpty(selectedGroup)) return;
    Modal.confirm({
      title: 'Do you want to delete this label group?',
      onOk: async () => {
        try {
          setProcessing(true);
          await actionDeleteLabelGroup(selectedGroup.id);
          props.actionGetLabelGroups();
          setProcessing(false);
        } catch (error) {
          console.log(error);
          setProcessing(false);
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const handleChangeManagers = (values = []) => {
    if (isUpdatingLabelGroup || isEmpty(selectedGroup)) return;
    setSelectedManagers(values);
    handleUpdateLabelGroup(values);
  };

  const handleUpdateLabelGroup = async (ownerIds = []) => {
    if (isEmpty(selectedGroup)) return;
    try {
      isUpdatingLabelGroup = true;
      await actionUpdateLabelGroup(selectedGroup.id, { owner_ids: ownerIds });
      props.actionGetLabelGroups();
      isUpdatingLabelGroup = false;
    } catch (error) {
      console.log(error);
      isUpdatingLabelGroup = false;
    }
  };

  return (
    <div className="labels-wrapper">
      {!isEmpty(selectedGroup) && (
        <div className="header-labels">
          <div className="group-info">
            <span className="lb-title">{selectedGroup?.name}</span>
            <Tooltip title="Edit label group">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => setTypeModal(TYPE_MODAL.ADD_EDIT_GROUP)}
              />
            </Tooltip>
            <Tooltip title="Delete label group">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteLabelGroup}
              />
            </Tooltip>
          </div>
          <Button
            type="primary"
            className="btn-add-label"
            onClick={() => setTypeModal(TYPE_MODAL.NEW_LABEL)}
            disabled={isEmpty(selectedGroup)}
            icon={<PlusOutlined />}
          >
            {t({ id: 'IDS_NEW_LABEL' })}
          </Button>
        </div>
      )}
      <Row className="select-managers" gutter={12}>
        <Col className="lb-title">Managers:</Col>
        <Col>
          <Select
            mode="multiple"
            style={{ minWidth: 290 }}
            allowClear={false}
            value={selectedManagers}
            onChange={handleChangeManagers}
            optionFilterProp="label"
          >
            {(users?.data || []).map((it) => (
              <Option
                key={it.id}
                value={it.id}
                disabled={it.id === userInfo.sub}
                label={it.username || ''}
              >
                {it.username || ''}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Spin spinning={isFetchingLabels}>
        <div className="labels-content">
          <div className="finding-wrapper">
            <div className="txt-title">{t({ id: 'IDS_FINDING' })}</div>
            <div className="label-table">
              <Table
                className="dark-table"
                size="small"
                loading={updateFinding}
                rowKey={(record) => record.id}
                dataSource={findingData || []}
                columns={findingColumns}
                pagination={false}
                scroll={{y: 350}}
              />
            </div>
          </div>
          <div className="impression-wrapper">
            <div className="txt-title">{t({ id: 'IDS_IMPRESSION' })}</div>
            <div className="label-table">
              <Table
                className="dark-table"
                size="small"
                loading={updateImpression}
                rowKey={(record) => record.id}
                dataSource={impressionData || []}
                columns={impressionColumns}
                pagination={false}
                scroll={{y: 350}}
              />
            </div>
          </div>
        </div>
      </Spin>
      {typeModal === TYPE_MODAL.NEW_LABEL && (
        <NewLabelModal
          projectId={projectId}
          onCancel={() => setTypeModal(null)}
          onOk={() => {
            handleGetLabels();
            setTypeModal(null);
          }}
          selectedGroup={selectedGroup}
        />
      )}
      {typeModal === TYPE_MODAL.ADD_EDIT_GROUP && (
        <AddEditGroup
          isEdit={true}
          onCancel={() => setTypeModal(null)}
          onOk={() => {
            props.actionGetLabelGroups();
            setTypeModal(null);
          }}
          selectedGroup={selectedGroup}
        />
      )}
      {typeModal === TYPE_MODAL.EDIT_LABEL && (
        <EditLabelModal
          isEdit={true}
          onCancel={() => setTypeModal(null)}
          onOk={() => {
            handleGetLabels();
            setTypeModal(null);
          }}
          item={selectedLabel}
        />
      )}
    </div>
  );
};

export default connect(
  (state) => ({
    labels: state.label.labels,
    isFetchingLabels: state.label.isFetchingLabels,
    selectedGroup: state.label.selectedLabelGroup,
    users: state.system.users,
    userInfo: state.system.profile,
  }),
  { actionGetLabelGroups, actionGetLabels, actionGetUsers }
)(Labels);
