import './MoreBar.scss';

const MoreBar = () => {
  return (
    <div className="morebar">
        <div className='price'>
            <div className='price-title'>
                <span>价格区间</span>
            </div>
            <div className='price-unit'>
                <div className='price-low'>
                    <input type="text" placeholder='最低价格'/>
                </div>
                -
                <div className='price-high'>
                    <input type="text" placeholder='最高价格'/>
                </div>
            </div>

        </div>

        <div className='sort'>
            <div className='sort-title'>
                <span>类别</span>
            </div>
            <div className='sort-list'>

            </div>
        </div>
        
    </div>
  );
}

export default MoreBar;