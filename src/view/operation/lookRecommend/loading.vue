
<template>
<div class="spin">
    <Row>
        <Col class="demo-spin-col" span="8">
            <Spin fix>
                <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                <div>Loading</div>
            </Spin>
        </Col>
    </Row>  
</div>
</template>
<script>
    export default {
        
    }
</script>

<style>
/* .ivu-spin-fix {} */ 
    .spin {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .demo-spin-col{
        height: 100px;
        position: relative;
        border: 1px solid #eee;
    }
</style>
